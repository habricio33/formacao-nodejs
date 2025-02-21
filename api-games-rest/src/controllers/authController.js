import bcrypt  from 'bcrypt';
import jwt  from 'jsonwebtoken';
import User from '../models/userModel.js';
import RefreshToken  from '../models/refreshToken.js';
import { v4 as uuidv4 } from "uuid";

export const register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        // Verifique se todos os campos obrigatórios estão presentes
           if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }
        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);
        // Cria o usuário no banco de dados
        const user = await User.create({ name, username, email, password: hashedPassword }); 

        res.status(201).json({ message: 'Usuario registrado com sucesso', user });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar usuario', error });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(401).json({ message: "Usuário não encontrado" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: "Senha inválida" });

        // Criar accessToken (expira rápido) e refreshToken (expira mais tarde)
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = uuidv4();
 

        // Armazena no banco de dados
        await RefreshToken.create({
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias de validade
        });

        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.errpr("Erro no login:", error)
        res.status(500).json({ message: "Erro interno" });
    }
}

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) return res.status(403).json({ message: "Refresh token é necessário" });

        const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });

        if (!storedToken || new Date(storedToken.expiresAt) < new Date()) {
            return res.status(403).json({ message: "Refresh token inválido ou expirado" });
        }

        // Criar novo accessToken
        const newAccessToken = jwt.sign({ id: storedToken.userId }, process.env.JWT_SECRET, { expiresIn: "15m" });

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error('Erro ao renovar token - refreshtoken:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};


export const logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) { // Verifica se refreshToken existe
        try {
            await RefreshToken.destroy({ where: { token: refreshToken } });
            res.json({ message: "Logout realizado com sucesso" });
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
            res.status(500).json({ message: "Erro ao fazer logout" });
        }
    } else {
        res.status(400).json({ message: "Refresh token não fornecido" });
    }
};


export const check = async (req, res) => {
    const refreshToken = req.headers["x-refresh-token"];

    if (!refreshToken) {
        return res.status(401).json({ message: "Sessão expirada" });
    }

    try {
        const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });
        if (!storedToken || new Date(storedToken.expiresAt) < new Date()) {
            return res.status(401).json({ message: "Sessão expirada" });
        }

        res.status(200).json({ message: "Sessão ativa" });
    } catch (error) {
        console.error("Erro na verificação no check:", error);
        res.status(401).json({ message: "Sessão expirada" });
    }
};