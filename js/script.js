
/** Get current date */
var today = new Date();
var currentDate = today.getDate();
var currentDay = today.getDay()
var currentYear = today.getFullYear();
var currentMonth = today.getMonth()+1;

class Calendar {

	static MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31];
	
	static CH_NUM_CHAR = ["一","二","三","四","五","六","七","八","九","十","十一","十二"];	
    static WEEK_TITLE_CH = ["周天","周一","周二","周三","周四","周五","周六"];
    static WEEK_TITLE_EN = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    static MONTH_CH = ["一月","二月","三月", "四月","五月","六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    static MONTH_EN = ["January","Febrary","March","April","May","June","July","Auguest","September","October","November","December"];
		
		
	constructor(selector="#calendar", events=[]) {
		this.el = document.querySelector(selector);
		this.events = events;

        this.activeDate = new Date();
        this.activeMonth = this.activeDate.getMonth();
        this.activeYear = this.activeDate.getFullYear();

		this.draw();
		// var current = document.querySelector('.today');
		// if(current) {
		// 	var self = this;
		// 	window.setTimeout(function() {
		// 		self.dayDropDown(current);
		// 	}, 500);
		// }
	}

	draw() {
		//Create Header
		this.drawHeader();
	
		//Draw Month
		if(this.monList) {
            self = this;
			this.oldList = this.monList;
			this.oldList.className = 'mon_list out ' + (self.next ? 'next' : 'prev');
			this.oldList.addEventListener('webkitAnimationEnd', function() {
                self.oldList.parentNode.removeChild(self.oldList);
                self.monList = createElement('div', 'mon_list');
                self.el.appendChild(self.monList);
                self.drawMonth(self.activeDate.getFullYear(), self.activeDate.getMonth());

				window.setTimeout(function() {
                    self.monList.className = 'mon_list in ' + (self.next ? 'next' : 'prev');
				}, 16);
			});
        } else {
			this.monList = createElement('div', 'mon_list new');

			this.el.appendChild(this.monList);
		    this.drawMonth(this.activeDate.getFullYear(), this.activeDate.getMonth());
        }
	
		// this.drawLegend();
	}
	drawHeader() {
        self = this;
		if(!this.header) {
			//Create the header elements
			this.header = createElement('div', 'header');

			let header_year = createElement('div', 'header_year');
			this.year = createElement('h1', 'year current', this.activeDate.getFullYear());

			let right_year = createElement('div', 'right');
			right_year.addEventListener('click', function() {self.nextYear();});

			let left_year = createElement('div', 'left');
			left_year.addEventListener('click', function() {self.prevYear();});

			let header_month = createElement('div', 'header_month');
			this.month = createElement('h2', 'month current', Calendar.MONTH_EN[this.activeDate.getMonth()]);

			let right_month = createElement('div', 'right');
			right_month.addEventListener('click', function() {self.nextMonth();});

			let left_month = createElement('div', 'left');
			left_month.addEventListener('click', function() {self.prevMonth();});

			//Append the Elements
			header_year.appendChild(this.year);
			header_year.appendChild(right_year);
			header_year.appendChild(left_year);
			header_month.appendChild(this.month);
			header_month.appendChild(right_month);
			header_month.appendChild(left_month);

			this.header.appendChild(header_year);
			this.header.appendChild(header_month);

			this.el.appendChild(this.header);
        
		}
    }
	drawLegend() {
		if(!this.legend) {
            var legend = createElement('div', 'legend');
            var calendars = this.events.map(function(e) {
                return e.calendar + '|' + e.color;
            }).reduce(function(memo, e) {
                if(memo.indexOf(e) === -1) {
                    memo.push(e);
                }
                return memo;
            }, []).forEach(function(e) {
                var parts = e.split('|');
                var entry = createElement('span', 'entry ' +  parts[1], parts[0]);
                legend.appendChild(entry);
            });
            this.el.appendChild(legend);
        }
	}
	drawMonth(year, month) {
        let weekTitle = createElement('div', 'week_titles');
        for (let i = 0; i < 7; i++) {
            weekTitle.appendChild(createElement('div', 'week_title', Calendar.WEEK_TITLE_EN[i]));
        }
        this.monList.appendChild(weekTitle);
		// this.events.forEach(function(ev) {
		// 	ev.date = self.current.clone().date(Math.random() * (29 - 1) + 1);
		// });

        var tempDate;
        var dayOfWeek;

        /* Back fill 
            - If the first day of this month is not the beginning of a week (Sunday), 
                then back fill the days of that week with the days of last month
        */
        tempDate =  new Date(year, month, 1); // first day of this month
        dayOfWeek = tempDate.getDay();
        if (dayOfWeek > 0) {
            // If that day is not Saturday
            for(let i = dayOfWeek; i > 0; i--) {
                tempDate =  new Date(year, month, -i+1);
                this.drawDay(tempDate);
            }
        }

        // /* Draw month */
        let totalDays = Calendar.getTotalDaysOfMonth(year, month); // Get total dates of this month
        for (let i = 0; i < totalDays; i ++) {
            tempDate = new Date(year, month, i+1);
            this.drawDay(tempDate);
        }
        
        // /* Forward fill 
        //     - If the last day of this month is not the end of a week (Saturday), 
        //       then forward fill the next days of that week with days of next month
        // */
        tempDate = new Date(year, month+1, 0); // last day of this month
        dayOfWeek = tempDate.getDay();
        if (dayOfWeek < 6) {
            for (let i = 0; i < 6-dayOfWeek ; i++) {
                tempDate = new Date(year, month+1, i+1); 
                this.drawDay(tempDate);
            }
        }

	}
	drawDay(date) {
        var self = this;
    
        /* Create a Week div 
        If there's no week div or when starting a new week */
        if(this.monList.childNodes.length == 0 || date.getDay() === 0) {
            this.week = createElement('div', 'week');
            this.monList.appendChild(this.week);
        }
    
        //Outer Day
        var outer = createElement('div', this.dayClassify(date));
        outer.addEventListener(
            'click', 
            function() {self.dayDropDown(this);}
        );
    
        //Day Name
        // var name = createElement('div', 'day-name', date.toDateString().substring(0,3));
    
        //Day Number
        var number = createElement('div', 'day-number', date.getDate());
    
    
        //Events
        var events = createElement('div', 'day-events');
        // this.drawEvents(date, events);
    
        // outer.appendChild(name);
        outer.appendChild(number);
        outer.appendChild(events);
        this.week.appendChild(outer);
    }

    /** Day */
    dayClassify(date) {
        let classes = ['day'];
        if(date.getMonth() !== this.activeDate.getMonth()) { // If the date is in current chosen month
            classes.push('other_month');
        } else {
            classes.push('chosen_month');
        }
        
        if (today > date) {
            if (today.toDateString() == date.toDateString()) {
                classes.push('today');
            } else {
                classes.push('before_today');
            }
        } else if (today < date){
            classes.push('after_today');
        }

        // if (currentYear == date.getFullYear()) {
        //     classes.push('current_year');

        //     if (currentMonth == date.getMonth()+1) { // If it's in this month
        //         classes.push('current_month');

        //         if (currentDate == date.getDate()) {  // If it's today
        //             classes.push('today');
        //         }
        //     }
        // } 
        return classes.join(' ');
    }
    /** Drop-down */
    dayDropDown(el) {

        var details, arrow;
        var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent;
        var day = new Date(this.activeDate.getFullYear, this.activeDate.getMonth, 12).getDate();
    
        /** Check if there already exist an open detail box */
        var currentDetailBox = document.querySelector('.details');

        if (currentDetailBox) {
            if (el.classList.contains("detailed")) {
                /** If the clicked date is for the current opened detailed box
                 *  - simply close it and end this method
                */
                currentDetailBox.addEventListener(
                    'webkitAnimationEnd', 
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox);}
                );
                currentDetailBox.addEventListener(
                    'oanimationend',
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox);}
                );
                currentDetailBox.addEventListener(
                    'msAnimationEnd', 
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox);}
                );
                currentDetailBox.addEventListener(
                    'animationend', 
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox);}
                );
                currentDetailBox.className = 'details out';
                el.classList.remove("detailed");
                return;
    
            } 
                
            /** If there's already an opened detail box */
            // Remove "detailed" class from current detailed date
            let currentDetailedDate = document.querySelector('.detailed')
            if (currentDetailedDate) { currentDetailedDate.classList.remove("detailed");}

            if(currentDetailBox.parentNode === el.parentNode) {
                /** If the detaied box is on a same row as the clicked date 
                 *  - Change the arrow 
                */
                details = currentDetailBox;
                arrow = document.querySelector('.arrow');
                arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
            } else {
                /**If the detaied box is on a different row from the clicked date 
                 * - Close it and create another one
                */
                currentDetailBox.addEventListener(
                    'webkitAnimationEnd', 
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox);}
                );
                currentDetailBox.addEventListener(
                    'oanimationend',
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox);}
                );
                currentDetailBox.addEventListener(
                    'msAnimationEnd', 
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox);}
                );
                currentDetailBox.addEventListener(
                    'animationend', 
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox);}
                );
                currentDetailBox.className = 'details out';
            }
        }

        // Add "detailed" class to current selection "
        el.classList.add("detailed");

        if (!currentDetailBox || currentDetailBox.parentNode != el.parentNode) {

            /** Create the Details Container */
            details = createElement('div', 'details in');
            /* Create the arrow */
            var arrow = createElement('div', 'arrow');
            arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';

            details.appendChild(arrow);
            el.parentNode.appendChild(details);
        }
    
        //Create the event wrapper

        // var todaysEvents = this.events.reduce(function(memo, ev) {
        //     if(ev.date.isSame(day, 'day')) {
        //         memo.push(ev);
        //     }
        //     return memo;
        // }, []);
    
        // this.renderEvents(todaysEvents, details);
    
    }
    
    /** Switch Month */
    nextMonth() {
        this.activeDate = new Date(this.activeYear, this.activeMonth+1);
        this.activeMonth = this.activeDate.getMonth();
        this.activeYear = this.activeDate.getFullYear();
        this.year.innerText = this.activeYear;
        this.month.innerText = Calendar.MONTH_EN[this.activeDate.getMonth()];
        if (currentYear == this.activeYear) {
            this.year.classList.add('current')
            if (currentMonth == this.activeMonth + 1) {
                this.month.classList.add('current')
            } else {
                this.month.classList.remove('current')
            }
        } else {
            this.year.classList.remove('current')
            this.month.classList.remove('current')
        }

        this.next = true;
        this.draw();
    }
    prevMonth() {
        this.activeDate = new Date(this.activeYear, this.activeMonth-1);
        this.activeMonth = this.activeDate.getMonth();
        this.activeYear = this.activeDate.getFullYear();
        this.year.innerText = this.activeYear;
        this.month.innerText = Calendar.MONTH_EN[this.activeDate.getMonth()];
        if (currentYear == this.activeYear) {
            this.year.classList.add('current')
            if (currentMonth == this.activeMonth + 1) {
                this.month.classList.add('current')
            } else {
                this.month.classList.remove('current')
            }
        } else {
            this.year.classList.remove('current')
            this.month.classList.remove('current')
        }
        this.next = false;
        this.draw();
    }
    /** Switch Year */
    nextYear() {
        this.activeDate = new Date(this.activeYear+1, this.activeMonth);
        this.activeYear = this.activeDate.getFullYear();
        this.year.innerText = this.activeYear;
        if (currentYear == this.activeYear) {
            this.year.classList.add('current')
            if (currentMonth == this.activeMonth + 1) {
                this.month.classList.add('current')
            }
        } else {
            this.year.classList.remove('current')
            this.month.classList.remove('current')
        }
        this.next = true;
        this.draw();
    }
    prevYear() {
        this.activeDate = new Date(this.activeYear-1, this.activeMonth);
        this.activeYear = this.activeDate.getFullYear();
        this.year.innerText = this.activeYear;
        if (currentYear == this.activeYear) {
            this.year.classList.add('current')
            if (currentMonth == this.activeMonth + 1) {
                this.month.classList.add('current')
            }
        } else {
            this.year.classList.remove('current')
            this.month.classList.remove('current')
        }
        this.next = false;
        this.draw();
    }

    static getTotalDaysOfMonth(year, month) {
        let totalDays;
        if (Calendar.isYearLeap(year) && month == 2) {
            totalDays = 29;
        } else {
            totalDays = (Calendar.MONTH_DAYS[month]);
        }
        return totalDays;
    }
    
	static isYearLeap(year) {
		return year % 4 == 0 ? (year % 100 != 0 ? 1 : (year % 400 == 0 ? 1 : 0)) : 0;
	}

}


function createElement(tagName, className, innerText) {
    let ele = document.createElement(tagName);
    if(className) {
        ele.className = className;
    }
    if(innerText) {
        ele.innderText = ele.textContent = innerText;
    }
    return ele;
}

const calender = new Calendar();