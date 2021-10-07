var all_squares = [[],[],[],[],[],[],[],[]]
var rows = [1,2,3,4,5,6,7,8].reverse()
var columns = ['A','B','C','D','E','F','G','H']
var columns_indexes = {'A':1,'B':2,'C':3,'D':4,'E':5,'F':6,'G':7,'H':8}
var squares_map = {}
var white_turn = true
var all_moves = []
var white_side = true
var selected_squares = []
var possible_squares = []



function rulesAllow(origin,target){
	// Check if the piece will take another
	if (target.piece){
		// Not allow if pieces are the same color
		if (origin.piece.color == target.piece.color) {
			return false
		}
	}

	// Pieces movements
	// Rook
	if ((origin.piece.type == 'queen') || (origin.piece.type == 'rook')){
		if ((origin.row == target.row) || (origin.column == target.column)){
			return true
		}
	}
	// Bishop
	if ((origin.piece.type == 'queen') || (origin.piece.type == 'bishop')) {
		if ((target.row+columns_indexes[origin.column] == origin.row+columns_indexes[target.column]) || (target.row-columns_indexes[origin.column] == origin.row-columns_indexes[target.column])){
			return true
		}
	}

	// Knight
	if (origin.piece.type == 'knight') {
		if ((Math.abs(origin.row-target.row) == 2 && Math.abs(columns_indexes[origin.column]-columns_indexes[target.column]) == 1) ||
			(Math.abs(origin.row-target.row) == 1 && Math.abs(columns_indexes[origin.column]-columns_indexes[target.column]) == 2)) {
			return true
		}
	}

	// King
	if (origin.piece.type == 'king') {
		if ((Math.abs(origin.row-target.row) < 2 && Math.abs(columns_indexes[origin.column]-columns_indexes[target.column]) < 2) ) {
			return true
		}
	}

	// Pawn
	if (origin.piece.type == 'pawn') {
		if ((origin.column == target.column)){
			// Check if pawn is in starting position
			if (((origin.piece.color == 'white') && (origin.row == 2) && ((target.row == 3) || (target.row == 4))) || ((origin.piece.color == 'black') && (origin.row == 7)  && ((target.row == 6) || (target.row == 5)))){
				return true
			}
			// If not in starting position, move it only one step forward
			if (((origin.piece.color == 'white') && ((target.row - origin.row) == 1)) || ((origin.piece.color == 'black') && ((origin.row - target.row) == 1))) {
				// Check if there is not a piece in target square
				if (!target.piece){
						return true
					}
				}
		}

		// Check if pawn is moving one square diagonally
			if (
				(Math.abs(columns_indexes[origin.column]-columns_indexes[target.column]) == 1) &&
				((((origin.row-target.row) == -1) && (origin.piece.color == 'white')) || (((origin.row-target.row) == 1) && (origin.piece.color == 'black')))
			)
			{
				// Check if target has a piece
				if ((target.piece)){
						return true
					}
				// Check if En Passant
				if (Math.abs(all_moves.at(-1).origin.row-all_moves.at(-1).target.row) == 2 ){
					// Check if origin pawn is in the correct position for En Passant
					if (target.column == all_moves.at(-1).origin.column){
						if (origin.row == all_moves.at(-1).target.row){
							// Remove taken pawn
							squares_map[all_moves.at(-1).target.column][all_moves.at(-1).target.row].piece.active = false
							squares_map[all_moves.at(-1).target.column][all_moves.at(-1).target.row].piece = null
							return true
						}
					}
				}
		}
	}

// Castling
// Blocking pieces
// Check
// Checkmate
// Switching sides

}

function main() {

	function select(square) { 
		let selected = document.getElementsByClassName("selected")
		let selected_square = squares_map[this.dataset.column][this.dataset.row]


		if (this.classList.contains('selected')){
			// If player selected this square before, unselect it
			this.classList.remove("selected") 
		} else {
			if (selected.length > 0) {
				// If there was a previous selected square...
				selected_piece = squares_map[selected[0].dataset.column][selected[0].dataset.row].piece
				// Unselect last selected square
				selected[0].classList.remove("selected")
				// If previous selected square had a piece, move it here.
				if (selected_piece) {
					selected_piece.move(this.dataset.column,this.dataset.row)
				}
			} else {
				// If this square has a piece, and it's the player's turn, select it
				if (selected_square.piece) {
					if ((white_turn && selected_square.piece.color == 'white') || (!white_turn && selected_square.piece.color == 'black')) {
						this.classList.add("selected") 
					}
				}

			}

		}
		Draw()
	}





	class Square {
		constructor (index, column, row) {
			this.row = row
			this.column = column

			this.white = (index % 8 + parseInt(index / 8 % 2 ) ) % 2
			this.element = document.createElement("div")
			this.element.dataset.row = this.row
			this.element.dataset.column = this.column
			this.element.classList.add('square')

			if (this.white) {
				this.element.classList.add('square-dark')
			} else {
				this.element.classList.add('square-light')
			}

			this.piece = null

			this.img = document.createElement('img')

			this.element.appendChild(this.img)

			this.element.addEventListener("click", select)

			this.selected = false

		}

		update_img () {
			if (this.piece){
				if (this.piece.active) {
					this.img.className = ''
					this.img.classList.add(`${this.piece.color}-${this.piece.type}`)
				}
			} else {
				this.img.className = ''
			}
		}

	}




	class Piece {
		constructor (color, type) {
			this.type = type
			this.color = color
			this.active = true
		}

		set (column,row) {
			this.square = squares_map[column][row]
			this.square.piece = this
			this.square.update_img()
			
			this.row = row
			this.column = column

		}

		move (column,row) {
			if (rulesAllow(this.square,squares_map[column][row])){
				// Add move to history
				all_moves.push({'piece':this.type,'origin':{'column':this.square.column,'row':this.square.row},'target':{'column':column,'row':parseInt(row)}})
				// Set taken piece as inactive
				if(squares_map[column][row].piece){squares_map[column][row].piece.active = false}
				this.square.piece = null
				// Move piece
				this.square = squares_map[column][row]
				this.square.piece = this
				// Promote pawn to queen
				if (((this.type == 'pawn') && ((this.square.row == 1) || (this.square.row == 8)))){this.type = 'queen'}
				// Change turn
				if (white_turn) {white_turn = false} else {white_turn = true}
			}

		}




	}



	// Creating squares

	chessboard = document.getElementById('chessboard')

	index = 0

	for (var j = 0; j < rows.length; j++) {
		for (var i = 0; i < columns.length; i++) {
			
			if (!squares_map[columns[i]]){
				squares_map[columns[i]] = {}
			}

			new_square = new Square(index, columns[i], rows[j])

			squares_map[columns[i]][rows[j]] = new_square

			index ++


		}
	}




	///////

// Need to separate setup and draw

// Need to create a coordinates system





function createPieces(){
	new Piece('white','rook').set('A',1)
	new Piece('white','knight').set('B',1)
	new Piece('white','bishop').set('C',1)
	new Piece('white','queen').set('D',1)
	new Piece('white','king').set('E',1)
	new Piece('white','bishop').set('F',1)
	new Piece('white','knight').set('G',1)
	new Piece('white','rook').set('H',1)

	new Piece('white','pawn').set('A',2)
	new Piece('white','pawn').set('B',2)
	new Piece('white','pawn').set('C',2)
	new Piece('white','pawn').set('D',2)
	new Piece('white','pawn').set('E',2)
	new Piece('white','pawn').set('F',2)
	new Piece('white','pawn').set('G',2)
	new Piece('white','pawn').set('H',2)

	new Piece('black','rook').set('A',8)
	new Piece('black','knight').set('B',8)
	new Piece('black','bishop').set('C',8)
	new Piece('black','queen').set('D',8)
	new Piece('black','king').set('E',8)
	new Piece('black','bishop').set('F',8)
	new Piece('black','knight').set('G',8)
	new Piece('black','rook').set('H',8)

	new Piece('black','pawn').set('A',7)
	new Piece('black','pawn').set('B',7)
	new Piece('black','pawn').set('C',7)
	new Piece('black','pawn').set('D',7)
	new Piece('black','pawn').set('E',7)
	new Piece('black','pawn').set('F',7)
	new Piece('black','pawn').set('G',7)
	new Piece('black','pawn').set('H',7)

}

createPieces()
/////////////////////////////////////
// Check blocking pieces
for (var i = 0; i < columns.length; i++) {
	for (var j = 0; j < rows.length; j++) {
		console.log(squares_map[columns[i]][rows[j]])
	}
}
//////////////////////////

function switchSide(){
	if (white_side) {
		setSide('black')
	} else {
		setSide('white')
	}
}

function setSide(color){
	if (color == 'white'){
		white_side = true
	} else {
		white_side = false
	}
	Draw()
}

setSide('white')



function Draw(){


	// Drawing squares

	chessboard = document.getElementById('chessboard')
	chessboard.innerHTML = ''


	if (white_side){
		for (var j = 0; j < rows.length; j++) {
			for (var i = 0; i < columns.length; i++) {

				chessboard.appendChild(squares_map[columns[i]][rows[j]].element)

				squares_map[columns[i]][rows[j]].update_img()


			}
	}} else {
	
		for (var j = rows.length -1; j >= 0 ; j--) {
			for (var i = columns.length -1; i >= 0 ; i--) {
	
				chessboard.appendChild(squares_map[columns[i]][rows[j]].element)
	
				squares_map[columns[i]][rows[j]].update_img()
	
	
			}
		}}



}







}
