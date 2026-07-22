import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel.js'; 

export const register = async (req, res) => {
    const { nom, prenom, email, password } = req.body;

    const isProduction = process.env.NODE_ENV === 'production' || (process.env.API_URL && !process.env.API_URL.includes('localhost'));

    console.log("=== [INSCRIPTION RESEND - EXAMEN] ===");
    console.log("Mode actif :", isProduction ? "PRODUCTION (Resend)" : "DEVELOPPEMENT (Terminal)");
    console.log("=====================================");

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

 
        const newUser = await UserModel.create(nom, prenom, email, hashedPassword, verificationToken); 

        const verificationLink = `${process.env.API_URL}/api/auth/verify/${verificationToken}`;

        if (isProduction) {
            try {
                console.log(`📨 Appel API Resend pour l'adresse : ${email}`);
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: "MadaVoyages <onboarding@resend.dev>", 
                        to: [email], 
                        subject: "Vérifiez votre compte MadaVoyages",
                        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                                   <h2 style="color: #b5431c;">Bienvenue ${prenom} !</h2>
                                   <p>Merci de rejoindre MadaVoyages. Pour finaliser votre inscription et activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
                                   <p style="margin: 30px 0;">
                                       <a href="${verificationLink}" style="padding: 12px 24px; background-color: #b5431c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Vérifier mon e-mail</a>
                                   </p>
                                   <p style="font-size: 0.85em; color: #666;">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur : <br>${verificationLink}</p>
                               </div>`
                    })
                });

                const result = await response.json();
                if (!response.ok) {
                    console.error("❌ Erreur retournée par Resend :", result);
                } else {
                    console.log("✅ E-mail envoyé avec succès via Resend ! ID :", result.id);
                }
            } catch (mailError) {
                console.error("❌ Exception réseau lors de l'appel Resend :", mailError.message);
            }
        } else {
            console.log("\n=======================================================================");
            console.log(`📨 [LOCAL] Compte créé ! Simulé pour : ${email}`);
            console.log("🔗 CLIQUE SUR CE LIEN POUR SIMULER LA VÉRIFICATION (Ctrl + Clic) :");
            console.log(`    ${verificationLink}`);
            console.log("=======================================================================\n");
        }

        return res.status(201).json({
            message: "Inscription réussie ! Un e-mail de confirmation vous a été envoyé pour activer votre compte.",
            user: { id: newUser.id, role: newUser.role } 
        });
        
    } catch (error) {
        console.error("Erreur critique d'inscription :", error);
        return res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
    }
};

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
        
        if (user.role === 'banni') {
            return res.status(403).json({ error: "Votre compte a été suspendu par un administrateur." });
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