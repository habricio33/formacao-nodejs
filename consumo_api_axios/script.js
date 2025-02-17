    document.addEventListener('DOMContentLoaded', function () {
        renderPage(); 
    });

    const myModal = new bootstrap.Modal(document.getElementById('modalForm'));
    const modalEdit = new bootstrap.Modal(document.getElementById('editModal'));

    function renderPage(){
       axios.get("http://localhost:8083/api/games/")
           .then( response => {                    
               let games = response.data;
               let list = document.getElementById("games-list");
               list.innerHTML = ""; 

               games.forEach(game => {
                   
                   // Criando um novo card para cada jogo
                   let card = document.createElement("div");
                   card.classList.add("card", "mb-3"); // Adicionando classes  

                   //setando os atributos no card
                   card.setAttribute("data-id", game.id);
                   card.setAttribute("data-title", game.title);
                   card.setAttribute("data-year", game.year);
                   card.setAttribute("data-price", game.price);

                   // Criando o card-header
                   let cardHeader = document.createElement("div");
                   cardHeader.classList.add("card-header");
                   cardHeader.innerHTML = `<strong>${game.title}</strong>`;    
                   // Convertendo o preço para número e garantindo que seja válido
                   let price = game.price ? Number(game.price).toFixed(2).replace('.', ',') : "N/A";
                   // Criando o card-body
                   let cardBody = document.createElement("div");
                   cardBody.classList.add("card-body");
                   cardBody.innerHTML = `<p>Ano: ${game.year}</p><p>Preço: R$ ${price}</p>`;
                   // Adicionando o header e body ao card
                   card.appendChild(cardHeader);
                   card.appendChild(cardBody);

                   let deleteButton = document.createElement("button");
                   deleteButton.classList.add("btn", "btn-danger", "float-end");
                   deleteButton.innerHTML = "Deletar";
                   deleteButton.addEventListener("click", () =>{
                       deletarGame(card);
                   })
                   cardBody.appendChild(deleteButton);

                   let editButton = document.createElement("button");
                   editButton.classList.add("btn", "btn-primary", "float-end", "me-3");
                   editButton.innerHTML = "Editar";
                   editButton.addEventListener("click", () => {
                       editGame(card);
                   })
                   cardBody.appendChild(editButton);

                   // Adicionando o card à div de listagem
                   list.appendChild(card);
               });


           }).catch( error => {
               console.log(error);
           });

    }

   
    function createGame() {
       let titleInput = document.getElementById("title");
       let yearInput = document.getElementById("year");
       let priceInput = document.getElementById("price");

       let game = {
           title: titleInput.value,
           year: yearInput.value,
           price: priceInput.value
       }

   
      axios.post("http://localhost:8083/api/games/", game).then( response => {
       
       if(response.status === 201 || response.status === 200) {
           myModal.hide();
           alert("Game cadastrado com sucesso!");
           document.getElementById("games-list").innerHTML = "";  
           renderPage(); 
       }
       
      }).catch( error => {
        console.log(`Houve um erro ao cadastrar: ${error} `)
      })
    }

    function editGame(cardItem) {

       let id = cardItem.getAttribute("data-id");      

       axios.get(`http://localhost:8083/api/games/${id}`).then( response => {                    
               let games = response.data;
               let titleInput = document.getElementById("titleEdit");
               let yearInput = document.getElementById("yearEdit");
               let priceInput = document.getElementById("priceEdit");

               document.getElementById("saveEdit").setAttribute("data-id", id);
               modalEdit.show();

               titleInput.value = games.title;
               yearInput.value = games.year;
               priceInput.value = games.price;      
               
               document.getElementById("saveEdit").addEventListener("click", function() {
                  let id = this.getAttribute("data-id");
                  if (id) saveEditedGame(id);
               });

               
           }).catch( error => {
               console.log(`Houve um erro ao fazer a busca pelo id: ${error} `)
           })
    }

    function saveEditedGame(id) {
       let titleInput = document.getElementById("titleEdit");
       let yearInput = document.getElementById("yearEdit");
       let priceInput = document.getElementById("priceEdit");

       let updatedGame = {
           title: titleInput.value,
           year: yearInput.value,
           price: priceInput.value
       };

       // Requisição PUT para atualizar o game
       axios.put(`http://localhost:8083/api/games/${id}`, updatedGame)
           .then(response => {
               if (response.status === 200 || response.status === 204) {
               modalEdit.hide();
                alert("Game editado com sucesso!");
                document.getElementById("games-list").innerHTML = "";  
                renderPage(); 
               }
           })
           .catch(error => {
               console.error("Erro ao atualizar o game:", error);
               alert("Erro ao atualizar o game. Tente novamente.");
           });
}

    function deletarGame(cardItem){
       let id = cardItem.getAttribute("data-id");
       axios.delete(`http://localhost:8083/api/games/${id}`)
       .then(response => {
           alert("Excluido com sucesso");
           cardItem.remove();
       })
       .catch( error => {
           console.log(`Houve um erro ao excluir: ${error} `)
       })
    }

    const dataAtual = new Date();
    const anoCorrente = dataAtual.getFullYear();
    document.getElementById("ano").innerText =  anoCorrente;