 // Função para obter o token do sessionStorage
function getAccessToken() { 
    const token = sessionStorage.getItem("accessToken");
    console.log("getAccessToken:", token); // Log do accessToken obtido
    return token;  
}
// Função para definir um novo token
function setAccessToken(token) {   
    sessionStorage.setItem("accessToken", token);
}

// Função para remover o token e efetuar logout
async function logout() {
    const refreshToken = sessionStorage.getItem("refreshToken"); // Obtém do sessionStorage
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    try {
        await axios.post("http://localhost:8083/api/auth/logout", { refreshToken });
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        Swal.fire("Deslogado!", "Sua sessão foi encerrada.", "success").then(() => {
            window.location.reload();
        });
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        Swal.fire("Erro!", "Não foi possível fazer logout.", "error");
    }
}

// Função para checar se a sessão está válida
 

async function checkSession() {
    const accessToken = getAccessToken();
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
        console.log("Token não encontrado. Exibindo modal de login...");
        return true; // Sessão expirada
    }

    try {
        console.log("Enviando requisição check com accessToken:", accessToken);

        const response = await axios.get("http://localhost:8083/api/auth/check", {
            headers: { 
                Authorization: `Bearer ${accessToken}`,
                "x-refresh-token": refreshToken
            }
        });

        console.log("Sessão válida:", response.data);
        return false; // Sessão válida

    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log("Token inválido. Tentando renovar...");

            if (typeof refreshToken === "function") { // Verifica se a função existe
                try {
                    const sessionExpired = await refreshToken();
                    return sessionExpired;
                } catch (refreshError) {
                    console.log("Falha ao renovar o token. Exibindo modal de login...");
                    return true;
                }
            }
        }

        console.log("Erro inesperado ao verificar sessão:", error);
        return true; // Sessão expirada por erro desconhecido
    }
}



let refreshPromise = null; // Variável global para armazenar a promessa atual da renovação

async function refreshToken() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = new Promise(async (resolve, reject) => {
        const refreshToken = sessionStorage.getItem("refreshToken");

        if (!refreshToken) {
            refreshPromise = null;
            logout();
            return reject(true);
        }

        try {
            const response = await axios.post("http://localhost:8083/api/auth/refreshToken", { refreshToken });

            if (response.data.accessToken) {
                setAccessToken(response.data.accessToken);
                refreshPromise = null;
                return resolve(false);
            } else {
                refreshPromise = null;
                logout();
                return reject(true);
            }
        } catch (error) {
            console.log("Falha ao renovar o token:", error);
            logout();
            refreshPromise = null;
            return reject(true);
        }
    });

    return refreshPromise;
}


// Intercepta respostas para capturar erro 401 (token expirado) e solicita um refreshToken para renova-lo
axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const sessionExpired = await refreshToken();
                if (!sessionExpired) {
                    originalRequest.headers['Authorization'] = `Bearer ${getAccessToken()}`;
                    return axios(originalRequest);
                }
            } catch (error) {
                console.log("Erro ao tentar renovar token:", error);
            }
        }

        return Promise.reject(error);
    }
);

document.addEventListener("DOMContentLoaded", async function () {
    const accessToken = getAccessToken(); // Verifica se já existe um accessToken   

    if (accessToken) { // Chama checkSession apenas se houver um accessToken
        try {
            const sessionExpired = await checkSession();
            if (sessionExpired) {
               // const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
               // loginModal.show();
               Swal.fire("Problema", "Sessão expirada");
            } else {
                renderPage();
            }
        } catch (error) {
            console.error("Erro ao verificar sessão:", error);
        }
    } else {
        const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
        loginModal.show(); // Exibe o modal de login se não houver accessToken
    }
});

async function login() {
    const username = document.getElementById("user").value;
    const password = document.getElementById("password").value;

    try {
        const response = await axios.post("http://localhost:8083/api/auth/login", {
            username,
            password
        }); 

        if (response.data.accessToken && response.data.refreshToken) {
            console.log("accessToken recebido login:", response.data.accessToken);
            // Armazena os tokens no sessionStorage
            setAccessToken(response.data.accessToken);
            sessionStorage.setItem("refreshToken", response.data.refreshToken);
            console.log("accessToken armazenado login:", getAccessToken());
            // Fecha o modal de login
            const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
            loginModal.hide();

            // Recarrega a página para atualizar o estado
            window.location.reload();
        } else {
            console.error("Tokens não recebidos do backend - login:", response.data);
            Swal.fire("Erro!", "Não foi possível fazer login.", "error");
        }
    } catch (error) {
        Swal.fire("Erro!", "Usuário ou senha inválidos.", "error");
    }
}

// Função para renderizar a página com lista de jogos
function renderPage() {
    axios.get("http://localhost:8083/api/games/", {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
    }).then(response => {
        let games = response.data;
        let list = document.getElementById("games-list");
        list.innerHTML = "";

        games.forEach(game => {
            let card = document.createElement("div");
            card.classList.add("card", "mb-3");
            card.setAttribute("data-id", game.id);

            let cardHeader = document.createElement("div");
            cardHeader.classList.add("card-header");
            cardHeader.innerHTML = `<strong>${game.title}</strong>`;

            let price = game.price ? Number(game.price).toFixed(2).replace('.', ',') : "N/A";

            let cardBody = document.createElement("div");
            cardBody.classList.add("card-body");
            cardBody.innerHTML = `<p>Ano: ${game.year}</p><p>Preço: R$ ${price}</p>`;

            let deleteButton = document.createElement("button");
            deleteButton.classList.add("btn", "btn-danger", "float-end");
            deleteButton.innerHTML = "Deletar";
            deleteButton.addEventListener("click", () => deletarGame(card));

            let editButton = document.createElement("button");
            editButton.classList.add("btn", "btn-primary", "float-end", "me-3");
            editButton.innerHTML = "Editar";
            editButton.addEventListener("click", () => editGame(card));

            cardBody.appendChild(deleteButton);
            cardBody.appendChild(editButton);

            card.appendChild(cardHeader);
            card.appendChild(cardBody);

            list.appendChild(card);
        });
    }).catch(error => console.log(error));
}

// Função para criar um novo game
function createGame() {
    let game = {
        title: document.getElementById("title").value,
        year: document.getElementById("year").value,
        price: document.getElementById("price").value
    };

    axios.post("http://localhost:8083/api/games/", game, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
    }).then(response => {
        if (response.status === 201 || response.status === 200) {

            Swal.fire("Cadastrado!", "Novo game cadastrado com sucesso!", "success");
            const modal = bootstrap.Modal.getInstance(document.getElementById("modalForm"));
            modal.hide();
            renderPage();
        }
    }).catch(() => {
        Swal.fire("Erro!", "Houve um erro ao cadastrar.", "error");
    });
}

// Função para editar um game
function editGame(cardItem) {
    let id = cardItem.getAttribute("data-id");

    axios.get(`http://localhost:8083/api/games/${id}`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
    }).then(response => {
        let game = response.data;
        document.getElementById("titleEdit").value = game.title;
        document.getElementById("yearEdit").value = game.year;
        document.getElementById("priceEdit").value = game.price;
        document.getElementById("saveEdit").setAttribute("data-id", id);

        const modalElement = document.getElementById("editModal");
        const modal = new bootstrap.Modal(modalElement); // Cria uma nova instância do modal
        modal.show(); // Exibe o modal

        document.getElementById("saveEdit").addEventListener("click", () => {
            saveEditedGame(id);
        });

    }).catch(error => console.log(`Erro ao buscar game: ${error}`));
}

// Função para salvar edições
function saveEditedGame(id) {
    let updatedGame = {
        title: document.getElementById("titleEdit").value,
        year: document.getElementById("yearEdit").value,
        price: document.getElementById("priceEdit").value
    };

    axios.put(`http://localhost:8083/api/games/${id}`, updatedGame, {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
    }).then(response => {
        if (response.status === 200 || response.status === 204) {
            const modalElement = document.getElementById("editModal");

            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modal.hide(); // Fecha o modal
            }

            Swal.fire("Editado!", "Game editado com sucesso!", "success");
            renderPage();
        }
    }).catch(() => {
        Swal.fire("Erro!", "Não foi possível editar o game.", "error");
    });
}

// Função para deletar um game
function deletarGame(cardItem) {
    let id = cardItem.getAttribute("data-id");

    Swal.fire({
        title: 'Deletar game',
        text: 'Tem certeza que deseja excluir?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: "Excluir",
        cancelButtonText: "Não"
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`http://localhost:8083/api/games/${id}`, {
                headers: { Authorization: `Bearer ${getAccessToken()}` }
            }).then(() => {
                Swal.fire("Excluído!", "", "success");
                cardItem.remove();
            }).catch(() => {
                Swal.fire("Erro!", "Não foi possível excluir o game.", "error");
            });
        }
    });
}

 
