// NONE = 0
// BLACK = 1
// WHITE = 2

var board;
var prevState;
var stateBefore;
var groups;
var isBlackTurn;

function init()
{
	board = new Array(9);
	prevState = new Array(9);
	stateBefore = new Array(9);
	groups = []
	
	for(i = 0; i < 9; i++)
	{
		board[i] = new Array(9);
		prevState[i] = new Array(9);
		stateBefore[i] = new Array(9);
		for(j = 0; j < 9; j++)
		{
			board[i][j] = 0;
			prevState[i][j] = 0;
			stateBefore[i][j] = 0;
		}
	}
	isBlackTurn = true;
}

function isValidPt(X, Y)
{
	return !(X < 0 || X > 8 || Y < 0 || Y > 8);
}

function containsPt(arr, X, Y)
{
	for(it = 0; it < arr.length; it++)
	{
		if (arr[it][0] == X && arr[it][1] == Y)
		{
			return true;
		}
	}
	return false;
}

function getNeighbours(X, Y)
{
	let result = []
	let points = [
	[X, Y+1],
	[X, Y-1],
	[X+1, Y],
	[X-1, Y]]
	for(i = 0; i < 4; i++)
	{
		if (isValidPt(points[i][0], points[i][1]))
		{
			result.push(points[i]);
		}
	}
	return result;
}

function getGroupsFromPt(X, Y)
{
	let capture = false;
	groups = [];
	let occupiedPoints = [];
	for(occI = 0; occI < 9; occI++)
	{
		for(occJ = 0; occJ < 9; occJ++)
		{
			if (board[occI][occJ] != 0 && !containsPt(occupiedPoints, occI, occJ))
			{
				if (occI == X && occJ == Y)
				{ continue; }
				let grp = new Group(occI, occJ, true);
				if (grp.captured == true)
				{
					capture = true;
				}
				groups.push(grp);
				occupiedPoints.push(...grp.members);
			}
		}
	}
	if (!occupiedPoints.includes([X, Y]) && board[X][Y] != 0)
	{
		let placedGroup = new Group(X, Y, true);
		if (placedGroup.captured == true && capture == false)
		{
			return false;
		}
		groups.push(placedGroup);
	}
	return true;
}

function getGroups()
{
	groups = [];
	let occupiedPoints = [];
	for(i = 0; i < 9; i++)
	{
		for(j = 0; j < 9; j++)
		{
			if (board[i][j] != 0 && !containsPt(occupiedPoints, i, j))
			{
				let grp = new Group(i, j, true);
				groups.push(grp);
				occupiedPoints.push(...grp.members);
			}
		}
	}
}

function copyArray(arr)
{
	arrCopy = JSON.parse(JSON.stringify(arr));
	return arrCopy;
}

function Place(value, X, Y)
{
	let temp = copyArray(stateBefore);
	stateBefore = copyArray(prevState);
	prevState = copyArray(board);
	
	board[X][Y] = value;
	isBlackTurn = !isBlackTurn;
	
	let valid = getGroupsFromPt(X, Y);
	
	
	if (JSON.stringify(board) == JSON.stringify(stateBefore) || !valid)
	{
		board = copyArray(prevState);
		prevState = copyArray(stateBefore);
		stateBefore = copyArray(temp);
		
		isBlackTurn = !isBlackTurn;
		getGroups();
	}
	
}


class Group
{
	constructor(X, Y, remove)
	{
		this.groupState = board[X][Y];
		if (this.groupState == 0)
		{
			return;
		}
		
		this.members = [[X, Y]];
		this.liberties = [];
		this.captured = false;
		
		var oldMembers = [];
		var expansion = [[X, Y]];
		
		do
		{
			oldMembers = copyArray(this.members);
			for(const newPt of expansion)
			{
				for(const neighbour of getNeighbours(newPt[0], newPt[1]))
				{
					if (board[neighbour[0]][neighbour[1]] == this.groupState)
					{
						this.members.push(neighbour);
					}
					else if(board[neighbour[0]][neighbour[1]] == 0)
					{
						this.liberties.push(neighbour);
					}
				}
			}
			
			/*
			for(expI = 0; expI < expansion.length; expI++)
			{
				let newPt = expansion[expI];
				let neighbours = getNeighbours(newPt[0], newPt[1]);
				for(nbI = 0; nbI < neighbours.length; nbI++)
				{
					let nPt = neighbours[nbI];
					if (board[nPt[0]][nPt[1]] == this.groupState)
					{
						this.members.push(nPt);
					}
					else if(board[nPt[0]][nPt[1]] == 0)
					{
						this.liberties.push(nPt);
					}
				}
			}*/
			
			expansion = [];
			for(const expPt of this.members)
			{
				if(!containsPt(oldMembers, expPt[0], expPt[1]))
				{
					expansion.push(expPt);
				}
			}
		} while (expansion.length != 0)
			
		if (this.liberties.length == 0 && remove == true)
		{
			this.captured = true;
			for(i = 0; i < this.members.length; i++)
			{
				let pt = this.members[i];
				board[pt[0]][pt[1]] = 0;
			}
			this.members = [];
		}
	}
}