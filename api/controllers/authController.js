import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel.js'; 

// 1. INSCRIPTION CONFORME EXAMEN (Via l'API Resend)
export const register = async (req, res) => {
    const { nom, prenom, email, password } = req.body;

    const isProduction = process.env.NODE_ENV === 'production' || (process.env.API_URL && !process.env.API_URL.includes('localhost'));

    if (!nom || !prenom || !email || !password) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    try {
        const existingUser = await UserModel.findByEmail(email); 
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const verificationToken = globalThis.crypto.randomUUID().replace(/-/g, '');

        // Sauvegarde Supabase
        const newUser = await UserModel.create(nom, prenom, email, hashedPassword, verificationToken); 

        const verificationLink = `${process.env.API_URL}/api/auth/verify/${verificationToken}`;

        if (isProduction) {
            // VRAI ENVOI EN LIGNE VIA RESEND
            try {
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: "MadaVoyages <onboarding@resend.dev>", // Domaine gratuit de Resend
                        to: [email], 
                        subject: "Vérifiez votre compte MadaVoyages",
                        html: `<h3>Bienvenue ${prenom} !</h3>
                               <p>Merci de rejoindre MadaVoyages. Cliquez ci-dessous pour valider votre compte :</p>
                               <a href="${verificationLink}" style="padding: 10px 20px; background-color: #b5431c; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Vérifier mon e-mail</a>`
                    })
                });
                console.log(`✅ Mail de production envoyé via Resend à ${email}`);
            } catch (mailError) {
                console.error("❌ Échec envoi Resend en production :", mailError.message);
            }
        } else {
            // AFFICHAGE TERMINAL EN LOCAL
            console.log("\n=======================================================================");
            console.log(`📨 [LOCAL] Lien de vérification : ${verificationLink}`);
            console.log("=======================================================================\n");
        }

        return res.status(201).json({
            message: "Inscription réussie ! Veuillez vérifier votre boîte de réception pour activer votre compte.",
            user: { id: newUser.id, role: newUser.role } 
        });
        
    } catch (error) {
        console.error("Erreur critique d'inscription :", error);
        return res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
    }
};

// 2. VÉRIFICATION DE L'E-MAIL
export const verifyEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const updatedUser = await UserModel.verify(token); 
        if (!updatedUser) { 
            return res.status(400).send(`
                <div style="text-align: center; margin-top: 10%; font-family: sans-serif;">
                    <h1 style="color: #b5431c;">Lien invalide ou expiré</h1>
                    <p>Ce lien a déjà été utilisé ou n'existe pas.</p>
                    <a href="/register.html" style="color: #051613; font-weight: bold;">Retourner à l'inscription</a>
                </div>
            `);
        }
        return res.redirect('/register.html?verified=true');
    } catch (error) {
        console.error("Erreur de vérification :", error);
        return res.status(500).send("<h1>Erreur interne lors de la vérification.</h1>");
    }
};

// 3. CONNEXION
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Veuillez remplir tous les champs." });
    }

    try {
        const user = await UserModel.findByEmail(email); 
        
        if (!user) { 
            await bcrypt.compare(password, "$2a$10$FakeHashForSecurityPurposesOnlyDoNotUseThis");
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }
        
        if (!user.is_verified) {
            return res.status(403).json({ error: "Veuillez vérifier votre email avant de vous connecter." });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: "Connexion réussie !",
            token,
            user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Erreur de connexion :", error);
        return res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
};