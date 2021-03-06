//get board from API
function getnewboard() {
    console.log("getting new board")
    boards = null
    difficulty = $("option:selected")[0].value
    const settings = {
        "async": false,
        "crossDomain": true,
        "url": "https://sudoku-board.p.rapidapi.com/new-board?diff=" + difficulty + "&stype=list&solu=true",
        "method": "GET",
        "headers": {
            "X-RapidAPI-Host": "sudoku-board.p.rapidapi.com",
            "X-RapidAPI-Key": "60efc189bamshcb0f7f12cdd3edbp11241cjsn3167c1d288b5"
        }
    };
    $.ajax(settings).done(function (response) {

        boards = response.response
    });
    var inputboard = Array(9);
    for (var i = 0; i < 9; i++) { inputboard[i] = Array(9) }
    boards["inputboard"] = inputboard
    boards["currentboard"] = JSON.parse(JSON.stringify(boards["unsolved-sudoku"]))
    return boards
}
function highlightcell(cellobject) {
    console.log("highlightcell")
    cellobject.css('background-color', 'var(--color-highlight)')
}
function highlightSelected() {
    console.log("highlightSelected")
    var selectedInput = $("#selectedInput").html()
    //reset all
    $(".cell").css('background-color', '')
    //highlight relevant
    highlightcell($(".cell:contains(" + selectedInput + ")"))

}

function clearBoard() {
    console.log("Clearing Board")
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            cellSelector = ".cell[data-row='" + (i + 1) + "'][data-column='" + (j + 1) + "']"
            $(cellSelector).html("")
            if ($(cellSelector).hasClass("static")) {
                $(cellSelector).removeClass("static")
            }
        }
    }
    highlightSelected()
}
function saveBoards() {
    console.log("Saving Boards")
    localStorage.setItem("boards", JSON.stringify(boards))
}
//setup board
function setupBoards() {
    console.log("setupBoards")
    boards = JSON.parse(localStorage.getItem("boards"))
    if (!boards) {
        boards = getnewboard()
        saveBoards()
    }
    populateBoard(boards["unsolved-sudoku"], true)
    populateBoard(boards["inputboard"], false)
    highlightSelected()

}
function newGame() {
    console.log("newgame")
    localStorage.removeItem("boards")
    clearBoard()
    setupBoards()
}
function checkWin() {
    var win = true

    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9 && win; j++) {
            win = (boards["currentboard"][i][j] == boards["solution"][i][j])
        }
    }

    return win
}
function winCongratulation() {
    for (var i = 0; i < 5; i++) {
        // $("body").css( 'background-color', 'var(--color-secondary)')
        $("body").hide(50).show(50)

    }
    $.dialog({
        title: 'Congratulations',
        content: "You Win!",
        theme: 'my-theme',
        boxWidth: '30%',
        useBootstrap: false,

    });
}
function populateBoard(board, static) {
    console.log("Populating Board")
    for (const [row_i, row] of board.entries()) {
        for (const [column_j, value] of row.entries()) {

            cellSelector = ".cell[data-row='" + (row_i + 1) + "'][data-column='" + (column_j + 1) + "']"
            cell = $(cellSelector)
            if (value != 0 && value != null) {

                cell.html(value)
                if (static) {
                    cell.addClass("static")
                }
            }
        }

    }

}
//function that takes a object and returns the first class name that starts with "theme-"
function getThemeClass(object) {
    var objectclasses = object.attr("class").split(/\s+/);
    return objectclasses.filter(objectclass => objectclass.startsWith("theme-"))[0]

}
function setupTheme(){
    savedTheme = localStorage.getItem("themeClass")
    if(savedTheme){
        $("body").toggleClass(getThemeClass($("body"))).toggleClass(savedTheme)
    }
}
function setCell(cellobject, number) {
    cellobject.html(number)

    var row = cellobject.attr("data-row") - 1
    var column = cellobject.attr("data-column") - 1

    boards["inputboard"][row][column] = number
    boards["currentboard"][row][column] = Number(number)
    saveBoards()
}


//run after page load
$(function () {
    $(".inputSelectorItem").click(function () {
        selectedCell = $(".cell.selectedCell")
        //if there is already a selected cell update its value to this
        if (selectedCell.length > 0) {
            setCell(selectedCell, $(this).html())
            selectedCell.removeClass("selectedCell")
        }
        //if there is no selected cell
        else {
            //if this is already selected unselect other wise select this
            thisAlreadySelected = $(this).attr('id') == 'selectedInput'
            $(".inputSelectorItem").removeAttr('id')
            if (!thisAlreadySelected) {
                $(this).attr('id', 'selectedInput')
            }
            highlightSelected()
        }
    })
    $(".cell").click(function () {
        var selectedInput = $("#selectedInput").html()
        if ($(this).hasClass("static")) {
            $(".inputSelectorItem:contains(" + $(this).html() + ")").click()
        }
        else if ($(this).html() == "" && selectedInput == null) {
            console.log("emptycell")
            highlightSelected()
            // highlightcell($(this))
            $(".selectedCell").toggleClass("selectedCell")
            $(this).addClass("selectedCell")
        }
        else {
            var row = $(this).attr("data-row") - 1
            var column = $(this).attr("data-column") - 1
            if (selectedInput == null || selectedInput == $(this).html()) {
                $(this).html("")
                boards["inputboard"][row][column] = undefined
                boards["currentboard"][row][column] = undefined
            }
            else {
                $(this).html(selectedInput)
                boards["inputboard"][row][column] = selectedInput
                boards["currentboard"][row][column] = Number(selectedInput)
            }
            highlightSelected()
        }

        saveBoards()
        console.log("Won?:" + checkWin())
        if (checkWin()) { winCongratulation() }
    })
    $(document).keypress(function(event){ 
        if(event.which >= 49 && event.which<=57){
            inputNumber = event.which % 48
            selectedCell = $(".cell.selectedCell")
            //if there is already a selected cell update its value to this
            if (selectedCell.length > 0) {
                setCell(selectedCell, inputNumber)
                selectedCell.removeClass("selectedCell")
            }
            else{
                $(".inputSelectorItem:contains(" + inputNumber +")").click()
            }
        }
    })

    $("#newGameButton").click(function () {
        $.confirm({
            theme: 'my-theme',
            boxWidth: '30%',
            useBootstrap: false,
            title: 'New Game',
            content: '',
            buttons: {

                Confirm: {
                    btnClass: 'my-theme',
                    action: function () {
                        newGame();
                    }
                },
                Cancel: {
                    btnClass: 'my-theme'

                }
            }
        })
    })

    $(".themeSelector").click(function () {

        $("body").toggleClass(getThemeClass($("body"))).toggleClass(getThemeClass($(this)))
        localStorage.setItem("themeClass",getThemeClass($(this)))
    })
    setupTheme()
    setupBoards()
});

