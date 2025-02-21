//Controlador (Lógica de Negócio)
import Game from "../models/gameModel.js";

//listar os jogos
export const getAllGames = async (req, res) => {
    try {

        const games = await Game.findAll({
            order: [['id', 'DESC']]
        });
        res.json(games);

    } catch (error) {
        res.status(500).json({ error: "Erro ao fazer a busca no BD"});
    }
} 

 
// lista jogo pelo id
export const getGameById = async (req, res) => {
    try {
        const { id } = req.params;  
        const game = await Game.findByPk(id); 

        if (!game) {
            return res.status(404).json({ error: "Jogo não encontrado" });
        }

        res.json(game);  
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar o jogo" });
    }
};


// criar novo jogo
export const createGame = async (req, res) => {
    try {
        const { title, year, price } = req.body;
        if (!title || !year || !price) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios" });
        }
        const newGame = await Game.create({ title, year, price });
        res.status(201).json(newGame);
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar o jogo"});
    }
}

//atualizar o jogo
export const updateGame = async (req, res) => {
    try {

        const { id } = req.params;
        const { title, year, price } = req.body;
        const game = await Game.findByPk(id);
        
        if(!game) {
            return res.status(404).json({ error: "Jogo não encontrado" });
        }

        await game.update({ title, year, price});
        res.json(game);

    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar o jogo"});
    }
}

export const deleteGame = async (req, res) => {
    try {

        const { id } = req.params;

        const game = await Game.findByPk(id);
        if (!game) {
          return res.status(404).json({ message: "Jogo não encontrado" });  
        } 
        await game.destroy();
        res.json({ message: "Jogo excluido com sucesso"});    

    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar o jogo"});
    }
}

export const authUser = async (req, res) => {
    try { 
        let { email, password } = req.body;
        if(email != undefined) {            

        } else {
            return res.status(400).json({ error: "Email inválido" });
        }

      } catch (error) {
        res.status(500).json({ error: "Erro ao deletar o jogo"});
    }
}

