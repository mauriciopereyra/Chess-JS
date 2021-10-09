function main(){

var piecesImg = {
	'white-pawn' : "https://upload.wikimedia.org/wikipedia/commons/0/04/Chess_plt60.png",
	'black-pawn' : "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chess_pdt60.png",
	'white-bishop' : "https://upload.wikimedia.org/wikipedia/commons/9/9b/Chess_blt60.png",
	'black-bishop' : "https://upload.wikimedia.org/wikipedia/commons/8/81/Chess_bdt60.png",
	'white-king' : "https://upload.wikimedia.org/wikipedia/commons/3/3b/Chess_klt60.png",
	'black-king' : "https://upload.wikimedia.org/wikipedia/commons/e/e3/Chess_kdt60.png",
	'white-knight' : "https://upload.wikimedia.org/wikipedia/commons/2/28/Chess_nlt60.png",
	'black-knight' : "https://upload.wikimedia.org/wikipedia/commons/f/f1/Chess_ndt60.png",
	'white-queen' : "https://upload.wikimedia.org/wikipedia/commons/4/49/Chess_qlt60.png",
	'black-queen' : "https://upload.wikimedia.org/wikipedia/commons/a/af/Chess_qdt60.png",
	'white-rook' : "https://upload.wikimedia.org/wikipedia/commons/5/5c/Chess_rlt60.png",
	'black-rook' : "https://upload.wikimedia.org/wikipedia/commons/a/a0/Chess_rdt60.png",
}





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
var blocking_squares = []

var kings = {}
var check = false
var white_pieces = []
var black_pieces = []
var white_queen = []

var castlings = {
'white':{'short':true,'long':true},
'black':{'short':true,'long':true},
}
var original_rooks = []
var square_under_check = null

var gameOver = false

function aca(square){
	select(this)
}

function unselectAll(){
	selected_squares = []
	possible_squares = []
	blocking_squares = []
}


function select(square) { 
	if (gameOver){return false}
	// console.log(this.firstChild.x)
	let selected_square = squares_map[this.dataset.column][this.dataset.row]
	// console.log(getPossibleSquares(selected_square))

	if (selected_squares.includes(selected_square)){
		// If player selected this square before, unselect it
		selected_squares = [] 
	} else {
		if (selected_squares.length > 0) {
			// If there was a previous selected square...
			selected_piece = selected_squares[0].piece
			if (selected_piece) {
				if (selected_square.piece) {
					// If selecting same color piece target, just select the new selected one
					if (selected_square.piece.color == selected_piece.color){
						selected_squares = [selected_square]
					} else {
					selected_squares = []
					selected_piece.move(selected_square.column,selected_square.row)
					}
				} else {
					// If previous selected square had a piece, move it here.
					selected_squares = []
					selected_piece.move(selected_square.column,selected_square.row)
				}
			}
		} else {
			// If this square has a piece, and it's the player's turn, select it
			if (selected_square.piece) {
				if ((white_turn && selected_square.piece.color == 'white') || (!white_turn && selected_square.piece.color == 'black')) {
					selected_squares.push(selected_square)
				}
			}

		}

	}

	// possible()
	// directions()
	Draw()
}


function setStatus(message){
	console.log(message)
	document.querySelector("#status h1").innerHTML = message
}





function removePossibleSquaresCheck(square){
	let piece = square.piece
	let possible_squares = getPossibleSquares(square)
	possible_squares = possible_squares.filter(square => (!kingWillBeUnderCheck(piece,square)))
	// possible_squares = possible_squares.filter(square => ())

	possible_squares = possible_squares.filter(square => {
		if (piece.type == 'king')
		{
			if (square.column == 'C' && square.row == 1){
				if (kingWillBeUnderCheck(piece,squares_map['D'][1])){
					return false
				}
			}
			if (square.column == 'G' && square.row == 1){
				if (kingWillBeUnderCheck(piece,squares_map['F'][1])){
					return false
				}
			}
			if (square.column == 'C' && square.row == 8){
				if (kingWillBeUnderCheck(piece,squares_map['D'][8])){
					return false
				}
			}
			if (square.column == 'G' && square.row == 8){
				if (kingWillBeUnderCheck(piece,squares_map['F'][8])){
					return false
				}
			}

		}





	return true
	})

	return possible_squares

	}





function getPossibleSquares(square){


	// function possible(square){
		let possible_squares = []
		let blocking_squares = []

		let selected_square = square
	
		for (var j = 0; j < rows.length; j++) {
			for (var i = 0; i < columns.length; i++) {
				if (rulesAllow(selected_square,squares_map[columns[i]][rows[j]])){
					possible_squares.push(squares_map[columns[i]][rows[j]])
					if (squares_map[columns[i]][rows[j]].piece){
						blocking_squares.push(squares_map[columns[i]][rows[j]])
					}
				} 

			}
			}

	// }




	// function directions(square){
		// Check all directions and remove squares that are blocked by other pieces

		origin = square
		directions_str = ['top-left','left','bottom-left','bottom','bottom-right','right','top-right','top']
		directions_formula = {'top-left':[-1,1],'left':[-1,0],'bottom-left':[-1,-1],'bottom':[0,-1],'bottom-right':[1,-1],'right':[1,0],'top-right':[1,1],'top':[0,1]}

		// Iterate over all directions
		for (var j = 0; j < directions_str.length; j++) {
			direction = directions_formula[directions_str[j]]
			let blocked = false
			for (var i = 1; (((columns_indexes[origin.column] + i* direction[0] ) > 0) && ((origin.row + i* direction[1] ) > 0) && ((columns_indexes[origin.column] + i* direction[0] ) <= 8) && ((origin.row + i* direction[1] ) <= 8)) ; i++) {
				output_column = (columns[columns_indexes[origin.column] + i* direction[0] -1])
				output_row = (origin.row + i* direction[1])
				
				// If this direction is already blocked, remove this square from possible and blocking squares
				if (blocked) {
					if (possible_squares.includes(squares_map[output_column][output_row])){
						possible_squares.splice(possible_squares.indexOf(squares_map[output_column][output_row]),1)
					}
					if (blocking_squares.includes(squares_map[output_column][output_row])){
						blocking_squares.splice(blocking_squares.indexOf(squares_map[output_column][output_row]),1)
					}

				}


				if (squares_map[output_column][output_row].piece){
					if (squares_map[output_column][output_row].piece.active){
						blocked = true
					}
				}

				// if(kingWillBeUnderCheck(origin.piece,target)){return false}

		    // possible_squares = possible_squares.filter(function(square, index, arr)
		    // 	{ 
		    // 		// if (square.column == '' && square.row == ''){

		    // 		// }

		    // 		if (kingWillBeUnderCheck())


		    		
		    // 	});



				// console.log(output_column)
				// console.log(output_row)
				// console.log(squares_map[output_column][output_row])
			}
			
		}



	return possible_squares

}







function rulesAllow(origin,target){
	// Check if the piece will take another
	if (target.piece){
		// Not allow if pieces are the same color
		// Seems to not be necessary anymore
		// if (origin.piece.color == target.piece.color) {
		// 	return false
		// }
	}

	if (!origin.piece){return false}


	if (target.piece){
		if (origin.piece.color == target.piece.color)
		{
			// console.log(origin.piece.color+target.piece.color)
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
		if (origin.piece.color =='white'){
			if (target.column == 'C' && target.row == 1){
				if (castlings['white']['long']){
					return ['castling','white','long']
				}
			}
			if (target.column == 'G' && target.row == 1){
				if (castlings['white']['short']){
					return ['castling','white','short']
				}
			}
		} 
		else {
			if (target.column == 'C' && target.row == 8){
				if (castlings['black']['long']){
					return ['castling','black','long']
				}
			}
			if (target.column == 'G' && target.row == 8){
				if (castlings['black']['short']){
					return ['castling','black','short']
				}
			}
		}


			if ((Math.abs(origin.row-target.row) < 2 && Math.abs(columns_indexes[origin.column]-columns_indexes[target.column]) < 2) ) {
				return true
			}


	}

	// Pawn
	if (origin.piece.type == 'pawn') {
		if ((origin.column == target.column)){
			// Check if pawn is in starting position and no piece in target
			if (!target.piece){
				if (((origin.piece.color == 'white') && (origin.row == 2) && ((target.row == 3) || (target.row == 4))) || ((origin.piece.color == 'black') && (origin.row == 7)  && ((target.row == 6) || (target.row == 5)))){
					return true
				}
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
				if (all_moves.length){
					// Check if origin pawn is in the correct position for En Passant
					if (Math.abs(all_moves.at(-1).origin.row-all_moves.at(-1).target.row) == 2 ){
						if (target.column == all_moves.at(-1).origin.column){
							if (origin.row == all_moves.at(-1).target.row){
								// Remove taken pawn
								return ['enPassant',squares_map[all_moves.at(-1).target.column][all_moves.at(-1).target.row]]
							}
						}
					}
				}
		}
	}

// Castling
// Blocking pieces V
// Check V
// Checkmate V
// Switching sides V
// Stalemate V

}





  function kingUnderCheck(){

		let kingUnderCheck = false
		let pieces = []

		if (white_turn){
			pieces = black_pieces
			king = kings['white']
		}else{
			pieces = white_pieces
			king = kings['black']
		}


		for (var i = 0; i < pieces.length; i++) {
			
			if ((getPossibleSquares(pieces[i].square).includes(king.square)) && (pieces[i].active == true)){
				kingUnderCheck = king
				
			}
		}

		return kingUnderCheck

  }






	function kingWillBeUnderCheck(piece_to_be_moved,target){

		let willBeUnderCheck = false
		let pieces = []

		// Get old piece
		old_piece = target.piece
		// Get old squares
		old_square = piece_to_be_moved.square

		// console.log('STEP 1')
		// console.log('old_square',old_square)
		// console.log('old_piece',old_piece)
		// console.log('target_square',target)
		// console.log(target.piece)



		// Deactivate old piece
		if (old_piece){old_piece.active = false}
		// Set old square empty
		piece_to_be_moved.square.piece = null
		// Move piece to target
		target.piece = piece_to_be_moved
		// Set new square to moved piece
		piece_to_be_moved.square = target


		// console.log('STEP 2')
		// console.log('old_square',old_square)
		// console.log('old_piece',old_piece)
		// console.log('target_square',target)
		// console.log(target.piece)





		if (piece_to_be_moved.color == 'white'){
			pieces = black_pieces
		}else{
			pieces = white_pieces
		}

		king = kings[piece_to_be_moved.color]

		for (var i = 0; i < pieces.length; i++) {
			
			if ((getPossibleSquares(pieces[i].square).includes(king.square)) && (pieces[i].active == true) ) {
				willBeUnderCheck = true
				
			}



		}




		// Set old square to piece moved
		piece_to_be_moved.square = old_square
		// Set piece moved square to piece moved
		piece_to_be_moved.square.piece = piece_to_be_moved
		// Return old piece to its square
		target.piece = old_piece
		// Reactivate old piece
		if (old_piece){old_piece.active = true}




		// console.log('STEP 3')
		// console.log('old_square',old_square)
		// console.log('old_piece',old_piece)
		// console.log('target_square',target)
		// console.log(target.piece)





		// // Reactivate old piece
		// if (old_piece){old_piece.active = true}
		// // Return old piece to its square
		// target.piece = old_piece
		// // Set old square to piece moved
		// piece_to_be_moved.square = old_square
		// // Set piece moved square to piece moved
		// piece_to_be_moved.square.piece = piece_to_be_moved

		return willBeUnderCheck

	}




	// function isCheckmate(color){
	// 	let pieces

	// 	if (color == 'black'){
	// 		pieces = black_pieces
	// 	}else{
	// 		pieces = white_pieces
	// 	}	

	// 	for (var i = 0; i < pieces.length; i++) {
	// 		let possible_squares = getPossibleSquares(pieces[i].square)

	// 		for (var j = 0; j < possible_squares.length; j++) {
	// 			if(!kingWillBeUnderCheck(pieces[i],possible_squares[j])){
	// 					let colorA = null
	// 					let colorB = null
	// 					if (pieces[i]){colorA=pieces[i].color}
	// 					if (possible_squares[j].piece){colorB=possible_squares[j].piece.color}

	// 					console.log(colorA+colorB)

	// 					if(!colorA==colorB){
	// 						console.log('Can move')
	// 						console.log(pieces[i])
	// 						console.log(possible_squares[j])
	// 						return false
	// 					}
					
				
	// 			}
	// 		}
	// 	}
	// 	return true
	// }

function reallyCheckmate(){
		let pieces

		if (white_turn){
			pieces = white_pieces
		}else{
			pieces = black_pieces
		}	
		pieces = pieces.filter(piece => piece.active)



		// Check if king can take attacking piece and won't be under check again
		let temp_possible_squares = removePossibleSquaresCheck(square_under_check)
		if (temp_possible_squares.length == 0){return true}
		for (var i = 0; i < temp_possible_squares.length; i++) {
			if (temp_possible_squares[i].length > 0){
				for (var j = 0; j < pieces.length; j++) {
					if(getPossibleSquares(pieces[j]).includes.kingUnderCheck().square){
						return true
					}
				}
			}
		}
		return false
}








	function isCheckmate(){
		let pieces

		if (white_turn){
			pieces = white_pieces
		}else{
			pieces = black_pieces
		}	

		pieces = pieces.filter(piece => piece.active)

		for (var i = 0; i < pieces.length; i++) {
			let temp_possible_squares = getPossibleSquares(pieces[i].square)

			for (var k = 0; k < temp_possible_squares.length; k++) {
				// console.log(pieces[i])
				// console.log(temp_possible_squares[k])
				if(!kingWillBeUnderCheck(pieces[i],temp_possible_squares[k])){

					if(temp_possible_squares[k].piece){
						if(!pieces[i].color == temp_possible_squares[k].piece.color){
							// console.log('Same color')
							// console.log('Can move')
							// console.log(pieces[i])
							// console.log(temp_possible_squares[k])
							return false
						}
					}else{
						// console.log('Can move2')
						// console.log(pieces[i])
						// console.log(temp_possible_squares[k])
						return false
					}



				}
			
			}

		}
		return true
	}



	function isStalemate(){
		let pieces

		if (white_turn){
			pieces = white_pieces
		}else{
			pieces = black_pieces
		}	

		pieces = pieces.filter(piece => piece.active)

		for (var i = 0; i < pieces.length; i++) {
			let temp_possible_squares = getPossibleSquares(pieces[i].square)
			// console.log(temp_possible_squares)

			for (var k = 0; k < temp_possible_squares.length; k++) {
				if(!kingWillBeUnderCheck(pieces[i],temp_possible_squares[k])){

					if(temp_possible_squares[k].piece){
						if(!pieces[i].color == temp_possible_squares[k].piece.color){
							// console.log('Same color')
							// console.log('Can move')
							// console.log(pieces[i])
							// console.log(temp_possible_squares[k])
							return false
						}
					}else{
						// console.log('Can move')
						// console.log(pieces[i])
						// console.log(temp_possible_squares[k])
						return false
					}



				}
			
			}

		}
		return true
	}





	function select_from_square(square){
		select(square.element)
	}

	function select_and_draw(square){
		select(square)
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
			// this.img.setAttribute('draggable', true);

			this.element.appendChild(this.img)

			// this.element.addEventListener("click", select)
			this.element.addEventListener("lla", select)
			// this.element.addEventListener("mouseup", select)
			this.element.addEventListener("mousedown", select)

      // this.img.addEventListener('dragstart', aca);
      // this.img.addEventListener('drag', aca);
      // this.img.addEventListener('dragenter', aca);
      // this.img.addEventListener('dragover', aca);
      // this.img.addEventListener('dragleave', aca);
      // this.img.addEventListener('drop', aca);
      // this.img.addEventListener('dragend', aca);

			this.selected = false

		}

		update_img () {

			if (selected_squares.includes(this)){
				this.element.classList.add("selected") 
			} else {
				this.element.classList.remove("selected") 
			}

			if (possible_squares.includes(this)){
				this.element.classList.add("possible") 
			} else {
				this.element.classList.remove("possible") 
			}

			if (blocking_squares.includes(this)){
				this.element.classList.add("blocking") 
			} else {
				this.element.classList.remove("blocking") 
			}

			if (this.piece){
				if (this.piece.active) {
					this.img.className = ''
					this.img.classList.add(`${this.piece.color}-${this.piece.type}`)
					this.img.classList.add('piece')
					this.img.style = ''
					this.img.dataset['x'] = 0
					this.img.dataset['y'] = 0
					this.img.innerHTML = ''
					// this.img.src = piecesImg[`${this.piece.color}-${this.piece.type}`]
					// this.img.style.visibility = "visible"
				}
			} else {
				this.img.className = ''
				if(this.img.src){
					// this.img.removeAttribute('src')
					// this.img.style.visibility = "hidden"
				}
			}
		}

	}




	class Piece {
		constructor (color, type) {
			this.type = type
			this.color = color
			this.active = true
			if (this.color == 'white'){white_pieces.push(this)} else {black_pieces.push(this)}
		}

		set (column,row) {
			this.square = squares_map[column][row]
			this.square.piece = this
			this.square.update_img()
			
			this.row = row
			this.column = column

		}

		move (column,row) {
			// console.log(all_moves)



			let moveIsAllowed = rulesAllow(this.square,squares_map[column][row])
			let enPassant = false
			let castling = false
			if (moveIsAllowed){
				if (kingWillBeUnderCheck(this,squares_map[column][row])){
				setStatus('You can\'t move here. You would be in check')
				return false
				}

				if (moveIsAllowed.length) {
					if (moveIsAllowed[0] == 'enPassant'){
						enPassant = true
					}
					if (moveIsAllowed[0] == 'castling'){
						castling = true
					}
				}
			}


			if (moveIsAllowed && removePossibleSquaresCheck(this.square).includes(squares_map[column][row])){
				// If En Passant, remove taken piece
				if (enPassant){
					moveIsAllowed[1].piece.active = false
					moveIsAllowed[1].piece = null
				}

				if (moveIsAllowed){

					function movePiece(piece,column,row){
						piece.square.piece = null
						piece.square = squares_map[column][row]
						piece.square.piece = piece
					}

					// Add move to history
					all_moves.push({'piece':this.type,'origin':{'column':this.square.column,'row':this.square.row},'target':{'column':column,'row':parseInt(row)}})
					

					// Disable castling if king or rook moved
					if (this.type == 'king'){castlings[this.color]['short'] = false; castlings[this.color]['long'] = false}
					if (this.type == 'rook')
						{
							if (original_rooks.includes(this)){
								if (this.square.column == 'A'){
									castlings[this.color]['long'] = false
								}else{
									castlings[this.color]['short'] = false
								}
							}
						}
					let target_piece = squares_map[column][row].piece
					if (target_piece){
						if (target_piece.type == 'rook')
							{
								if (original_rooks.includes(target_piece)){
									if (target_piece.square.column == 'A'){
										castlings[target_piece.color]['long'] = false
									}else{
										castlings[target_piece.color]['short'] = false
									}
								}
							}
					}

					if (castling){
						if (column == 'C' && row == 1){movePiece(original_rooks.find(rook => {return (rook.square.column == 'A' && rook.square.row == 1)}),'D',1)}
						if (column == 'G' && row == 1){movePiece(original_rooks.find(rook => {return (rook.square.column == 'H' && rook.square.row == 1)}),'F',1)}
						if (column == 'C' && row == 8){movePiece(original_rooks.find(rook => {return (rook.square.column == 'A' && rook.square.row == 8)}),'D',8)}
						if (column == 'G' && row == 8){movePiece(original_rooks.find(rook => {return (rook.square.column == 'H' && rook.square.row == 8)}),'F',8)}
					}


					// Set taken piece as inactive
					if(squares_map[column][row].piece){squares_map[column][row].piece.active = false}
					// Move piece
					movePiece(this,column,row)

					// Promote pawn to queen
					if (((this.type == 'pawn') && ((this.square.row == 1) || (this.square.row == 8)))){this.type = 'queen'}

					// Change turn
					if (white_turn) {white_turn = false} else {white_turn = true}

					// Check if it's checkmate
				 //  let inverse_color = ''
				 //  if (this.color == 'white'){inverse_color = 'black'}else{inverse_color = 'white'}
					// console.log('STARTING\n')
					
				}
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




function createPieces(){

	kings = {'white':new Piece('white','king'),'black':new Piece('black','king')}
	kings['white'].set('E',1)
	kings['black'].set('E',8)

	white_queen = new Piece('white','queen')
	white_queen.set('D',1)

	rook = new Piece('white','rook')
	rook.set('A',1)
	original_rooks.push(rook)
	new Piece('white','knight').set('B',1)
	new Piece('white','bishop').set('C',1)
	new Piece('white','bishop').set('F',1)
	new Piece('white','knight').set('G',1)
	rook = new Piece('white','rook')
	rook.set('H',1)
	original_rooks.push(rook)

	new Piece('white','pawn').set('A',2)
	new Piece('white','pawn').set('B',2)
	new Piece('white','pawn').set('C',2)
	new Piece('white','pawn').set('D',2)
	new Piece('white','pawn').set('E',2)
	new Piece('white','pawn').set('F',2)
	new Piece('white','pawn').set('G',2)
	new Piece('white','pawn').set('H',2)

	rook = new Piece('black','rook')
	rook.set('A',8)
	original_rooks.push(rook)
	new Piece('black','knight').set('B',8)
	new Piece('black','bishop').set('C',8)
	new Piece('black','queen').set('D',8)
	new Piece('black','bishop').set('F',8)
	new Piece('black','knight').set('G',8)
	rook = new Piece('black','rook')
	rook.set('H',8)
	original_rooks.push(rook)

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

// Set and switch sides

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


document.addEventListener("keypress", function(event) {
  if (event.keyCode == 13) {
    // switchSide()
    console.log(kingUnderCheck())

  }
});



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



if(kingUnderCheck()){

	square_under_check = kingUnderCheck().square
	
	square_under_check.element.classList.add('check')


	if(isCheckmate()){


		if (!reallyCheckmate()){
			setStatus('Check')
		}else{
			setStatus('Checkmate')
			gameOver = true
		}


	}	else {setStatus('Check')}
			}
	else	if(isCheckmate()){
		setStatus('Stalemate')
		gameOver = true
		}
	else{

		if (white_turn){
				setStatus('Your turn')
		} else {
				setStatus('Waiting for opponent')
		}

		if (square_under_check){
				square_under_check.element.classList.remove('check')
				square_under_check.element.classList.remove('check')
				square_under_check = null}
	}


// Show possible squares

if(selected_squares.length==1){
	let possibleSquares = removePossibleSquaresCheck(selected_squares[0])
	possibleSquares.map((square) => {
  square.element.classList.add('possible')
	})
}else{
	if(document.getElementsByClassName('possible').length > 0){
		document.getElementsByClassName('possible').map((square) => {
			square.element.classList.remove('possible')
		})
	}
}


}



}