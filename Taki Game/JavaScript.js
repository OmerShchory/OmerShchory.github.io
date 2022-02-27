{
    //----Cards Arrays----
    colors = ['blue', 'red', 'yellow', 'green'];
    types = [1, 3, 4, 5, 6, 7, 8, 9, "changesDirection", "2plush", "stop", "taki"];

    //------Global Variables----
    image_pth = '"images/';
    turn = 1; //1 for p1, -1 for p2
    var player_cards_num = 8;
    var counter = 1; //counting player numbers
    var is_Game = false; //true when game starts
    var opening_card; //the top card on the table to showcase
    var TableDeck = []; //list of revieled cards on the table
    var TopTableCard = []; //list of 1 top card to showcase on top of all revieled cards
    var is_chashier_pic_on = false; //display once in a game
    var choosedColor = "";
    var lastTurnWasColorchanger = false;
    var otherPName = "";
    var currentName = "";
    var isGameOver = false; //indicates if the table deck and cashier is empty, so the game restarts 



    //-----Constructors--------
    //constructor card
    function Card(type, color, img, name) {
        this.type = type; //from types list
        this.color = color; //from colors list
        this.img = img;
        this.name = name; //type_color
    }

    //constructor deck
    function Deck() {
        this.Cards = [];
        //field
        this.createDeck = function () {
            //create every possible card using any combination of type and color
            //except color changer
            for (var i = 0; i < colors.length; i++) {
                for (var j = 0; j < types.length; j++) {
                    image_path = 'images/' + types[j] + "_" + colors[i] + '.jpg';
                    temp_name = types[j] + "_" + colors[i];
                    temp_card = new Card(types[j], colors[i], image_path, temp_name);
                    this.addCard(temp_card);
                }
            }
            //handling color changer
            color_changer_path = "images/color_changer.jpg";
            color_changer1 = new Card(-1, "color_changer", color_changer_path, "colorchanger_1");
            color_changer2 = new Card(-1, "color_changer", color_changer_path, "colorchanger_2");
            this.addCard(color_changer1);
            this.addCard(color_changer2);

        }
        //field
        this.Shuffle = function () {
            for (var i = this.Cards.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * i);
                var temp = this.Cards[i];
                this.Cards[i] = this.Cards[j];
                this.Cards[j] = temp;
            }
        }
        //field
        this.addCard = function (card) {
            this.Cards.push(card);
        }
        //field
        this.removeCard = function (card) {
            this.Cards.pop(card);
        }
    }

    //constructor player
    function Player() {
        this.num = counter;
        this.cards = [];
        counter++;
    }


    //-------game objects---------
    playerOne = new Player();//player one
    playerTwo = new Player();//player two
    Cashier = new Deck(); //cashier deck


    //------Functions------
    //function handing out 8 cards for a player from a given deck
    function cards_for_player(deck, player) {
        for (var i = 0; i < player_cards_num; i++) {
            player.cards.push(deck.Cards[i]); //assuming deck is shuffled
        }
        //remove the cards of the player from the cashier
        for (var i = 0; i < player.cards.length; i++) {
            idx = deck.Cards.indexOf(player.cards[i]);
            deck.Cards.splice(idx, 1);
        }
    }

    //function write to div
    function writeToDiv(divId, htmlStr, override) {
        let d = document.getElementById(divId);
        if (override)
            d.innerHTML = htmlStr;
        else
            d.innerHTML += htmlStr;
    }

    //function getting a color choosed by the user
    function UserColor(color) {
        document.getElementById("colorChoose").style.display = "none";
        colorChoosed = color;
        document.getElementById("update_turn").innerHTML = `Turn: ${otherPName}`;
    }

    //function presnting colors after picking color changer card
    function renderColors(div, array) {
        str = "<p>Choose Color</p>";
        for (var i = 0; i < array.length; i++) {
            picClass = 'class ="' + 'color' + '_pic"';
            str += "<img src='" + 'images/' + array[i] + '.png' + "'" + picClass + 'onclick="UserColor(' + "'" + array[i] + "'" + ')"' + "/>";
        }
        writeToDiv(div, str, true);
        document.getElementById("colorChoose").style.display = "none";
    }

    //function managing the cashier if it is empty - or close to being empty
    function cashierManager() {
        //if the cashier cards array is almost empty
        if (Cashier.Cards.length == 2) {
            alert("Cashier is about to get empty!");
        }
        //if the cashier is empty and table deck has only 1 card
        if (Cashier.Cards.length == 0 && TableDeck.length == 1) {
            alert("Cashier is empty! There is only one card in table Deck. Can't refiil Cashier. GAME OVER!");
            start(50);
            isGameOver = true;
        }

        //if the cashier cards array is empty - take cards from the table deck
        if (Cashier.Cards.length == 0) {
            //keeping the last card
            last_revield_card = TopTableCard[0];
            //removing the last card from the table deck so it won't be passed to the cashier
            TableDeck.splice(TableDeck.length - 1, 1);
            //adding all the cards from table deck to the cashier
            for (var i = 0; i < TableDeck.length; i++) {
                Cashier.Cards.push(TableDeck[i]);
            }
            var len = TableDeck.length;
            //removing all the cards from table deck
            for (var i = 0; i < len; i++) {
                TableDeck.pop();
            }
            //leaving the last revield card of the table cards on the table
            TableDeck.push(last_revield_card);
            //shuffle the cashier
            Cashier.Shuffle();
            //display images update
            document.getElementById("Deck").innerHTML = "<p>Table Deck</p>"; //removing the last top card
            renderImages("Deck", TopTableCard); //rendering new top card on table
            //alerting the user what has happened since nothing changed on the screen
            alert("Cashier is empty! taking cards from the table deck for the cashier")
        }
    }

    //function manging a player turn - checks if the turn is valid, and the choosed card is valid
    function playerTurn(Player, identity, clicked_card_color, clicked_card_type) {
        document.getElementById("message").innerHTML = "";
        var otherPNum;
        var otherP;
        if (Player.num == 1) { //updating the paragraphs to display
            otherNum = 2;
            otherP = playerTwo;
            otherPName = "Player Two";
            currentName = "Player One";
        }
        else {
            otherNum = 1;
            otherP = playerOne;
            otherPName = "Player One"
            currentName = "Player Two";;

        }

        //if player clicked on cashier
        if (clicked_card_color == 'cashier') {
            //is the cashier is empty - handle it
            cashierManager();
            //if the game has restarted because the cashier was empty and tabledeck had only 1 deck,
            //there no need to add a card to a player
            if (!isGameOver) {
                //draw card from cashier and add it to the player array
                drawed_card = Cashier.Cards.pop();
                Player.cards.push(drawed_card);
                document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num}</p>`;
                renderImages(`p${Player.num}`, Player.cards); //rendering new cards
                //update the turn
                turn = turn * -1;
                document.getElementById("update_turn").innerHTML = `Turn: ${otherPName}`;
                return;
            }
            isGameOver = false;
            return; 
        }
        //------ if picked card is not color changer------------
        if (clicked_card_color != "color_changer") {
            //---- if last turn player picked color changer---
            if (lastTurnWasColorchanger) {
                // if the player choosed the valid card after color changer
                if (clicked_card_color == colorChoosed) {
                    //searching the card to remove from player array of cards
                    var i = 0;
                    var idx;
                    for (; i < Player.cards.length; i++) //find the chosen card in the player array
                    {
                        if (Player.cards[i].color == clicked_card_color && Player.cards[i].type == clicked_card_type) {
                            idx = i;
                            break;
                        }
                    }
                    //updating table deck
                    TableDeck.push(Player.cards[idx]);
                    Player.cards.splice(idx, 1);
                    TopTableCard = []; //always has one card only - empty the last one
                    TopTableCard.push(TableDeck[TableDeck.length - 1]); //update
                    document.getElementById("Deck").innerHTML = "<p>Table Deck</p>"; //removing the last top card
                    document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num} </p>`; //removing the last cards
                    renderImages(`p${Player.num}`, Player.cards); //rendering new cards
                    renderImages("Deck", TopTableCard); //rendering new top card on table
                    lastTurnWasColorchanger = false;
                }

                else // if the player choosed an invalid card after color changer
                //add a card to the player array from the cashier
                {
                    //if the cashier is empty handle it
                    cashierManager();
                    drawed_card = Cashier.Cards.pop();
                    Player.cards.push(drawed_card);
                    document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num} </p>`;
                    renderImages(`p${Player.num}`, Player.cards); //rendering new cards
                    lastTurnWasColorchanger = true;
                }
            }

            //if last turn player didn't pick color changer - check if the clicked card is matching to the top table card
            else if (TopTableCard[0].color == clicked_card_color || TopTableCard[0].type == clicked_card_type) {
                //search for the card to remove from the player array and add it to the table top
                var i = 0;
                var idx;
                for (; i < Player.cards.length; i++) { //find the chosen card in the player array
                    if (Player.cards[i].color == clicked_card_color && Player.cards[i].type == clicked_card_type) {
                        idx = i;
                        break;
                    }
                }
                TableDeck.push(Player.cards[idx]);
                Player.cards.splice(idx, 1);
                TopTableCard = []; //always has one card only - empty the last one
                TopTableCard.push(TableDeck[TableDeck.length - 1]); //update
                document.getElementById("Deck").innerHTML = "<p>Table Deck</p>"; //removing the last top card
                document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num} </p>`; //removing the last cards
                renderImages(`p${Player.num}`, Player.cards); //rendering new cards
                renderImages("Deck", TopTableCard); //rendering new top card on table

            }
            else { //the player chose an invalid card 
                cashierManager();
                drawed_card = Cashier.Cards.pop();
                Player.cards.push(drawed_card);
                document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num} </p>`;
                renderImages(`p${Player.num}`, Player.cards); //rendering new cards
            }
        }
        //if picked card is color changer
        else { //the player put color changer on the table - can be put on any card - no matter type/color 
            lastTurnWasColorchanger = true;
            var i = 0;
            var idx;
            //search for the crad to remove
            for (; i < Player.cards.length; i++) {
                if (Player.cards[i].color == "color_changer") {
                    idx = i;
                    break;
                }
            }
            TableDeck.push(Player.cards[idx]);
            Player.cards.splice(idx, 1);
            TopTableCard = []; //always has one card only - empty the last one
            TopTableCard.push(TableDeck[TableDeck.length - 1]); //update
            document.getElementById("Deck").innerHTML = "<p>Table Deck</p>"; //removing the last top card
            document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num} <p>`; //removing the last cards
            renderImages(`p${Player.num}`, Player.cards); //rendering new cards
            renderImages("Deck", TopTableCard); //rendering new top card on table
            document.getElementById("colorChoose").style.display = "block";
        }

        // if the clicked card is 2plush and >> a valid card
        if (clicked_card_type == "2plush" && (TopTableCard[0].color == clicked_card_color || TopTableCard[0].type == clicked_card_type)) {
            //draw 2 cards from cashier and add them to the other player array
            cashierManager();
            drawed_card = Cashier.Cards.pop();
            otherP.cards.push(drawed_card);
            document.getElementById(`p${otherP.num}`).innerHTML = `<p>Player ${otherP.num} </p>`;
            renderImages(`p${otherP.num}`, otherP.cards); //rendering new cards
            //check if there are any cards in the cashier
            cashierManager();
            drawed_card = Cashier.Cards.pop();
            otherP.cards.push(drawed_card);
            document.getElementById(`p${otherP.num}`).innerHTML = `<p>Player ${otherP.num} </p>`;
            renderImages(`p${otherP.num}`, otherP.cards); //rendering new cards
        }

        // if the clicked card is taki and >> a valid card
        if (clicked_card_type == "taki" && (TopTableCard[0].color == clicked_card_color || TopTableCard[0].type == clicked_card_type)) {
            //all the cards that the player has of the given taki color
            var colored_cards = [];
            for (var i = 0; i < Player.cards.length; i++) //finding all the colored cards in player array
            {
                //add to the color cards array all the cards that are of the same color of taki
                if (Player.cards[i].color == clicked_card_color) {
                    colored_cards.push(Player.cards[i]);
                }
            }
            //remove all the cards of the given color from the player array and put them on the table
            for (var i = 0; i < colored_cards.length; i++) { //removing the colored cards from the player array
                var idx = Player.cards.indexOf(colored_cards[i]);
                Player.cards.splice(idx, 1);
                TableDeck.push(colored_cards[i]);
            }
            document.getElementById(`p${Player.num}`).innerHTML = `<p>Player ${Player.num} </p>`;
            renderImages(`p${Player.num}`, Player.cards); //rendering new cards
            TopTableCard = []; //always has one card only - empty the last one
            TopTableCard.push(TableDeck[TableDeck.length - 1]); //update
            document.getElementById("Deck").innerHTML = "<p>Table Deck</p>"; //removing the last top card
            renderImages("Deck", TopTableCard); //rendering new top card on table
        }
        // if the clicked card is stop or changeDirection and >> a valid card
        if ((clicked_card_type == "stop" || clicked_card_type == "changesDirection") && (TopTableCard[0].color == clicked_card_color || TopTableCard[0].type == clicked_card_type)) {
            document.getElementById("update_turn").innerHTML = `Turn: ${currentName}`;
        }
        // if not stop or changeDircetion >> pass the turn on
        else {
            //update turn
            turn = turn * -1;
            if (lastTurnWasColorchanger) {
                document.getElementById("update_turn").innerHTML = `Turn: ${currentName}`;
            }
            else {
                document.getElementById("update_turn").innerHTML = `Turn: ${otherPName}`;
            }
        }
    }

    //function make game moves according to player's choosen card - the function checks if the click is on the right turn, on the right card, and messages if a player wins
    function picClick(identity, clicked_card_color, clicked_card_type) { 
        if (is_Game) {
            if (identity == "p1" || identity == "p2" || identity == "cashier") {
                if (identity == "cashier") { //1 for p1, -1 for p2
                    if (turn == 1) {
                         //if p1 clicked a card and the turn is his
                        playerTurn(playerOne, identity, clicked_card_color, clicked_card_type)
                    }
                    else { //p1 clicked a card and it wasn't their turn
                        playerTurn(playerTwo, identity, clicked_card_color, clicked_card_type)
                    }
                    //if player one wins
                    if (playerOne.cards.length == 0) {
                        alert("Player one wins the game! Well done! Restarting Game.");
                        start(50);
                    }
                    //if player two wins
                    if (playerTwo.cards.length == 0) {
                        alert("Player Two wins the game! Well done! Restarting Game. ");
                        start(50);
                    }
                }

                if (identity == "p1") { //1 for p1, -1 for p2
                    if (turn == 1) {
                        
                        playerTurn(playerOne, identity, clicked_card_color, clicked_card_type)
                    }

                    else { //p1 clicked a card and it wasn't their turn
                        document.getElementById("message").innerHTML = "It is not your turn!";
                    }
                    if (playerOne.cards.length == 0) {
                        alert("Player one wins the game! Well done! Restarting Game.");
                        start(50);
                    }

                    //end of player one turn
                }
                else if (identity == "p2") {
                    if (turn == -1) {
                        //if player two clicks a card and the turn is theirs
                        playerTurn(playerTwo, identity, clicked_card_color, clicked_card_type)
                    }
                    else { //p2, turn == 1
                        document.getElementById("message").innerHTML = "It is not your turn!";
                    }
                    if (playerTwo.cards.length == 0) {
                        alert("Player Two wins the game! Well done! Restarting Game.");
                        start(50);
                    }
                    //end of player two turn
                }
            }
        }
    }

    //function change is_game to true if game started
    function game() {
        is_Game = true;
        document.getElementById("message").innerHTML = "Game has started!";
    }

    //showing images of cards to screen
    function renderImages(div, cards) {
        str = "";
        for (var i = 0; i < cards.length; i++) {
            picClass = 'class ="' + div + '_pic"';
            str += "<img src='" + cards[i].img + "'" + picClass + 'onclick="picClick(' + "'" + div + "'" + ", '" + cards[i].color + "'" + ", '" + cards[i].type + "'" + ')"' + "/>";
        }
        writeToDiv(div, str, false);
    }

    //funtcion start is starting the game
    function start(deck_size) {
        //rendering the colors - making sure the colors are not displayed when color changer is not choosed
        renderColors("colorChoose", colors);
        //updating global variables in order to restart the game
        turn = 1;
        counter = 1;
        is_Game = false;
        TableDeck = [];
        TopTableCard = [];
        playerOne.cards = [];
        playerTwo.cards = [];
        //update headers
        document.getElementById("Deck").innerHTML = "<p>Table Deck</p>";
        document.getElementById("p1").innerHTML = "<p>Player 1</p>";
        document.getElementById("p2").innerHTML = "<p>Player 2</p>";
        document.getElementById("update_turn").innerHTML = 'Turn: Player One';
        //create cashier, shuffle it and hand out 8 cards for each player
        Cashier.Cards = [];
        Cashier.createDeck();
        Cashier.Shuffle();
        //randomly choose open card
        opening_card = Cashier.Cards[Math.floor(Math.random() * (deck_size - 1)) + 1];
        // assuring color changer is not the first card on table deck at the beggining of the game
        while (opening_card.color == "color_changer") {
            opening_card = Cashier.Cards[Math.floor(Math.random() * (deck_size - 1)) + 1];
        }
        TableDeck.push(opening_card);
        idx = Cashier.Cards.indexOf(opening_card);
        Cashier.Cards.splice(idx, 1);
        cards_for_player(Cashier, playerOne);
        cards_for_player(Cashier, playerTwo);
        upside_down_img = "<img src='" + 'images/' + 'cashier' + '.jpg' + "'" + "class='cashier'" + 'onclick="picClick(' + "'" + 'cashier' + "'" + ", '" + 'cashier' + "'" + ", '" + 'cashier' + "'" + ')"' + "/>";
        TopTableCard.push(TableDeck[TableDeck.length - 1]);
        renderImages("Deck", TopTableCard);
        if (!is_chashier_pic_on) { //don't show cashier pic again if already displayed
            is_chashier_pic_on = true;
            document.getElementById("Cashier").innerHTML += upside_down_img;
        }
        //display cards and headers
        renderImages("p1", playerOne.cards);
        renderImages("p2", playerTwo.cards);
        document.getElementById("message").innerHTML = "Press the 'Start Playing' button to start the game";
        document.getElementById("game").style.display = "block";
        document.getElementById("pressDrw").style.display = "none";
        isGameOver = false;
    }
}