// prettier-ignore

class BudgetTracker {
	constructor() {
		this._budgetLimit = Storage.getBudgetLimit();
		this._totalBudget = Storage.getTotalBudget(0);
		this._outgoings = Storage.getOutgoings();
		this._income = Storage.getIncomes();

        

		this._displayBudgetLimit();
		this._displayBudgetTotal();
		this._displayBudgetConsumed();
		this._displayBudgetSpent();
		this._displayBudgetRemaining();
		this._displayBudgetProgress();
        
        document.getElementById('limit').value = this._budgetLimit;
	}
	// Public Methods/API
	addOutgoing(outgoing) {
		this._outgoings.push(outgoing);
		this._totalBudget -= outgoing.amount;
        Storage.updateTotalBudget(this._totalBudget);
        Storage.saveOutgoing(outgoing);
		this._displayNewOutGoing(outgoing);
		this._render();
	}
	addExtraIncome(income) {
		this._income.push(income);
		this._totalBudget += income.amount;
        Storage.updateTotalBudget(this._totalBudget);
        Storage.saveIncome(income);
        this._displayNewIncome(income);
		this._render();
	}

    removeOutgoing(id) {
        const index = this._outgoings.findIndex((outgoing) => outgoing.id === id);

        if (index != -1) {
            const outgoing = this._outgoings[index];
            this._totalBudget += outgoing.amount;
            Storage.updateTotalBudget(this._totalBudget)
            this._outgoings.splice(index, 1);
            Storage.removeOutgoing(id)
            this._render();
        }
    }
    removeIncome(id) {
        const index = this._income.findIndex((income) => income.id === id);

        if (index != -1) {
            const income = this._income[index];
            this._totalBudget -= income.amount;
            Storage.updateTotalBudget(this._totalBudget)
            this._income.splice(index, 1);
            Storage.removeIncome(id)
            this._render();
        }
    }

    reset() {
        this._totalBudget = 0;
        Storage.updateTotalBudget(this._totalBudget);
        this._outgoings = [];
        this._income = [];
        Storage.clearAll();
        this._render();
    }
    setLimit(budgetLimit) {
        this._budgetLimit = budgetLimit;
        Storage.setBudgetLimit(budgetLimit);
        this._displayBudgetLimit();
        this._render();
    }
loadItems(){
    this._outgoings.forEach(outgoing => this._displayNewOutGoing(outgoing));
    this._income.forEach(income => this._displayNewIncome(income));
}
	// Private Methods

	_displayBudgetTotal() {
        
		const totalBudgetEl = document.getElementById('budget-total');
		totalBudgetEl.innerHTML = `£${this._totalBudget.toFixed(2)}`;
        
	}
	_displayBudgetLimit() {
		const limitBudgetEl = document.getElementById('budget-limit');
		limitBudgetEl.innerHTML = `£${this._budgetLimit.toFixed(2)}`;
        console.log('Budget Limit:', this._budgetLimit);
	}

	_displayBudgetConsumed() {
		const budgetConsumedEl = document.getElementById('budget-consumed');

		// Calculate total outgoings
		const totalOutgoings = this._outgoings.reduce(
			(total, outgoing) => total + outgoing.amount,
			0
		);

		// Calculate total income
		const totalIncome = this._income.reduce(
			(total, income) => total + income.amount,
			0
		);

		// Net consumed as a negative value
		const netConsumed = totalIncome - totalOutgoings;

		// Display the result
		budgetConsumedEl.innerHTML = `£${netConsumed.toFixed(2)}`;

        if (netConsumed < 0) {
            budgetConsumedEl.parentElement.classList.remove('bg-light', 'bg-warning', 'bg-dark', 'text-white', 'text-dark');
            budgetConsumedEl.parentElement.classList.add('bg-warning');
        } else if (netConsumed >= 50) {
            budgetConsumedEl.parentElement.classList.remove('bg-light', 'bg-warning', 'text-dark');
            budgetConsumedEl.parentElement.classList.add('bg-dark', 'text-white');
        } else {
            budgetConsumedEl.parentElement.classList.remove('bg-warning', 'bg-dark', 'text-white');
            budgetConsumedEl.parentElement.classList.add('bg-light', 'text-dark');
        }
    }

	_displayBudgetSpent() {
		const budgetSpentEl = document.getElementById('budget-spent');
		const spent = this._outgoings.reduce(
			(total, outgoing) => total + outgoing.amount,
			0
		);

		budgetSpentEl.innerHTML = `£${spent.toFixed(2)}`;
        
	}

	_displayBudgetRemaining() {
		const budgetRemainingEl = document.getElementById('budget-remaining');
		const progressEl = document.getElementById('budget-progress');

		const totalIncome = this._income.reduce(
			(total, income) => total + income.amount,
			0
		);
		const totalSpent = this._outgoings.reduce(
			(total, outgoing) => total + outgoing.amount,
			0
		);
		const remaining = this._budgetLimit + totalIncome - totalSpent;

		budgetRemainingEl.innerHTML = `£${remaining.toFixed(2)}`;

		if (remaining <= 0) {
			budgetRemainingEl.parentElement.parentElement.classList.remove(
				'bg-light'
			);
			budgetRemainingEl.parentElement.parentElement.classList.add('bg-danger');
			progressEl.classList.remove('bg-success');
			progressEl.classList.add('bg-danger');
		} else {
			budgetRemainingEl.parentElement.parentElement.classList.remove(
				'bg-danger'
			);
			budgetRemainingEl.parentElement.parentElement.classList.add('bg-light');
			progressEl.classList.remove('bg-danger');
			progressEl.classList.add('bg-success');
		}
       
	}

	_displayBudgetProgress() {
		const progressEl = document.getElementById('budget-progress');

		const totalSpent = this._outgoings.reduce(
			(total, outgoing) => total + outgoing.amount,
			0
		);
		const percentage =
			(totalSpent /
				(this._budgetLimit +
					this._income.reduce((total, inc) => total + inc.amount, 0))) *
			100;

		const width = Math.min(percentage, 100); // Limit progress to 100%
		progressEl.style.width = `${width}%`;
	}
	// New items
	
	_displayNewOutGoing(outgoing) {
		const outgoingsEl = document.getElementById('outgoing-items');
		const outgoingEl = document.createElement('div');
		outgoingEl.classList.add('card', 'my-2');
		outgoingEl.setAttribute('data-id', outgoing.id);
        
        const formattedAmount = `£${parseFloat(outgoing.amount).toFixed(2)}`;
		outgoingEl.innerHTML = `<div class="card-body">
        <div class="d-flex align-items-center justify-content-between">
        <h4 class="mx-1">${outgoing.name}</h4>
        <div class="fs-1 bg-primary text-white text-center rounded-2 px-2 px-sm-5">${formattedAmount}</div>
	<button class="delete btn btn-danger btn-sm mx-2">
	<i class="fa-solid fa-xmark"></i>
	</button>
		</div>
	</div>
    `;
  
		outgoingsEl.appendChild(outgoingEl);
	}

    _displayNewIncome(income) {
		const incomesEl = document.getElementById('income-items');
		const incomeEl = document.createElement('div');
		incomeEl.classList.add('card', 'my-2');
		incomeEl.setAttribute('data-id', income.id);
        
        const formattedAmount = `£${parseFloat(income.amount).toFixed(2)}`;
		incomeEl.innerHTML = `<div class="card-body">
        <div class="d-flex align-items-center justify-content-between">
        <h4 class="mx-1">${income.name}</h4>
        <div class="fs-1 bg-secondary text-white text-center rounded-2 px-2 px-sm-5">${formattedAmount}</div>
	<button class="delete btn btn-danger btn-sm mx-2">
	<i class="fa-solid fa-xmark"></i>
	</button>
		</div>
	</div>
    `;
  
		incomesEl.appendChild(incomeEl);
	}
     


	_render() {
		this._displayBudgetTotal();
		this._displayBudgetConsumed();
		this._displayBudgetSpent();
		this._displayBudgetRemaining();
		this._displayBudgetProgress();
	}
}

class Outgoing {
	constructor(name, amount) {
		this.id = Math.random().toString(16).slice(2);
		this.name = name;
		this.amount = amount;
	}
}
class Income {
	constructor(name, amount) {
		this.id = Math.random().toString(16).slice(2);
		this.name = name;
		this.amount = amount;
	}
}

// Local Storage
class Storage {
	static getBudgetLimit(defaultLimit = 3000) {
		let budgetLimit;
		if (localStorage.getItem('budgetLimit') === null) {
			budgetLimit = defaultLimit;
		} else {
			budgetLimit = +localStorage.getItem('budgetLimit');
		}
		return budgetLimit;
	}

	static setBudgetLimit(budgetLimit) {
		localStorage.setItem('budgetLimit', budgetLimit);
	}

	static getTotalBudget(defaultBudget = 0) {
		let totalBudget;
		if (localStorage.getItem('totalBudget') === null) {
			totalBudget = defaultBudget;
		} else {
			totalBudget = +localStorage.getItem('totalBudget');
		}
		return totalBudget;
	}
	static updateTotalBudget(budget) {
		localStorage.setItem('totalBudget', budget);
	}

	static getOutgoings() {
		let outgoings;
		if (localStorage.getItem('outgoings') === null) {
			outgoings = [];
		} else {
			outgoings = JSON.parse(localStorage.getItem('outgoings'));
		}
		return outgoings;
	}
	static saveOutgoing(outgoing) {
		const outgoings = Storage.getOutgoings(); // Fetch the existing outgoings array
		outgoings.push(outgoing); // Push the new outgoing object into the array
		localStorage.setItem('outgoings', JSON.stringify(outgoings)); // Save the updated array
	}

	static removeOutgoing(id) {
		const outgoings = Storage.getOutgoings();
		outgoings.forEach((outgoing, index) => {
			if (outgoing.id === id) {
				outgoings.splice(index, 1);
			}
		});

		localStorage.setItem('outgoings', JSON.stringify(outgoings));
	}

	static getIncomes() {
		let incomes;
		if (localStorage.getItem('incomes') === null) {
			incomes = [];
		} else {
			incomes = JSON.parse(localStorage.getItem('incomes'));
		}
		return incomes;
	}
	static saveIncome(income) {
		const incomes = Storage.getIncomes(); // Fetch the existing incomes array
		incomes.push(income); // Push the new outgoing object into the array
		localStorage.setItem('incomes', JSON.stringify(incomes)); // Save the updated array
	}
	static removeIncome(id) {
		const incomes = Storage.getIncomes();
		incomes.forEach((income, index) => {
			if (income.id === id) {
				incomes.splice(index, 1);
			}
		});

		localStorage.setItem('incomes', JSON.stringify(incomes));
	}
	static clearAll() {
		localStorage.clear();
	}
}

class App {
	constructor() {
		this._tracker = new BudgetTracker();
		this._loadEventListeners();
		this._tracker.loadItems();
	}

	_loadEventListeners() {
		document
			.getElementById('outgoings-form')
			.addEventListener('submit', this._newOutgoing.bind(this));

		document
			.getElementById('income-form')
			.addEventListener('submit', this._newIncome.bind(this));
		document
			.getElementById('outgoing-items')
			.addEventListener('click', this._removeItem.bind(this, 'outgoing'));
		document
			.getElementById('income-items')
			.addEventListener('click', this._removeItem.bind(this, 'income'));
		document
			.getElementById('filter-outgoings')
			.addEventListener('keyup', this._filterItems.bind(this, 'outgoing'));
		document
			.getElementById('filter-income')
			.addEventListener('keyup', this._filterItems.bind(this, 'income'));
		document
			.getElementById('reset')
			.addEventListener('click', this._reset.bind(this));
		document
			.getElementById('limit-form')
			.addEventListener('submit', this._setLimit.bind(this));
	}

	_newOutgoing(e) {
		e.preventDefault();
		const name = document.getElementById('outgoing-name');
		const cost = document.getElementById('outgoing-cost');

		// Validate the inputs
		if (name.value === '' || cost.value === '') {
			alert('Please fill in all fields');
			return;
		}

		const outgoing = new Outgoing(name.value, +cost.value);

		this._tracker.addOutgoing(outgoing);

		name.value = '';
		cost.value = '';

		const collapseOutgoing = document.getElementById('collapse-outgoing');
		const bsCollapse = new bootstrap.Collapse(collapseOutgoing, {
			toggle: true
		});
	}

	_newIncome(e) {
		e.preventDefault();
		const name = document.getElementById('income-name');
		const cost = document.getElementById('income-cost');

		// Validate the inputs
		if (name.value === '' || cost.value === '') {
			alert('Please fill in all fields');
			return;
		}

		const money = new Income(name.value, +cost.value);

		this._tracker.addExtraIncome(money);

		name.value = '';
		cost.value = '';

		const collapseIncome = document.getElementById('collapse-income');
		const bsCollapse = new bootstrap.Collapse(collapseIncome, {
			toggle: true
		});
	}

	_removeItem(type, e) {
		if (
			e.target.classList.contains('delete') ||
			e.target.classList.contains('fa-xmark')
		) {
			if (confirm('Are you sure')) {
				const id = e.target.closest('.card').getAttribute('data-id');

				type === 'outgoing'
					? this._tracker.removeOutgoing(id)
					: this._tracker.removeIncome(id);

				e.target.closest('.card').remove();
			}
		}
	}

	// Filter items
	_filterItems(type, e) {
		const text = e.target.value.toLowerCase();
		document.querySelectorAll(`#${type}-items .card`).forEach((item) => {
			const name = item.firstElementChild.firstElementChild.textContent;

			if (name.toLowerCase().indexOf(text) !== -1) {
				item.style.display = 'block';
			} else {
				item.style.display = 'none';
			}
		});
	}

	_reset() {
		this._tracker.reset();
		document.getElementById('outgoing-items').innerHTML = '';
		document.getElementById('income-items').innerHTML = '';
		document.getElementById('filter-outgoings').value = '';
		document.getElementById('filter-income').value = '';
	}

	_setLimit(e) {
		e.preventDefault();
		const limit = document.getElementById('limit');

		if (limit.value === 0) {
			alert('Please a limit');
			return;
		}
		this._tracker.setLimit(+limit.value);
		limit.value = '';

		const modalEl = document.getElementById('limit-modal');
		const modal = bootstrap.Modal.getInstance(modalEl);
		modal.hide();
	}
}

const app = new App();
