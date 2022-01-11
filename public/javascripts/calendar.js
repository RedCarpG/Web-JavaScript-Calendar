/** Get current date */
var today = moment().startOf('day')
var currentDate = today.date()
var currentDay = today.day()
var currentYear = today.year()
var currentMonth = today.month()+1


class Calendar {

	// static MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31]
	
	// static CH_NUM_CHAR = ["一","二","三","四","五","六","七","八","九","十","十一","十二"]	
    // static WEEK_TITLE_CH = ["周天","周一","周二","周三","周四","周五","周六"]
    // static WEEK_TITLE_EN = ["SUN","MON","TUE","WED","THU","FRI","SAT"]
    // static MONTH_CH = ["一月","二月","三月", "四月","五月","六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
    // static MONTH_EN = ["January","Febrary","March","April","May","June","July","Auguest","September","October","November","December"]
		
		
	constructor(selector="#calendar", events=[]) {
		this.el = document.querySelector(selector)
		this.events = events

        this.activeDate = moment().startOf('day')
        this.activeMonth = this.activeDate.month()
        this.activeYear = this.activeDate.year()
        // Initialize
        this.header = this.el.querySelector('.header')
        this.year = this.header.querySelector('.year')
        this.year.classList.add("current")
        this.month = this.header.querySelector('.month')
        this.month.classList.add("current")
        this.update()
        this.legend = this.el.querySelector('.legend')
        
		let current = this.el.querySelector('.today')
		if (current) {
			let self = this
			window.setTimeout(function() {
				self.choseDay(current)
			}, 500)
		}
	}

	update() {
        // Update Header
        this.year.innerText = this.activeYear
        this.month.innerText = this.activeDate.format('MMMM')
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

		// Update Month
		if (this.monList) {
            self = this
			this.oldList = this.monList
			this.oldList.className = 'mon-list out ' + (self.next ? 'next' : 'prev')
			this.oldList.addEventListener('webkitAnimationEnd', function() {
                self.oldList.parentNode.removeChild(self.oldList)
                self.monList = createElement('div', 'mon-list')
                self.el.appendChild(self.monList)
                self.updateMonth(self.activeYear, self.activeMonth)

				window.setTimeout(function() {
                    self.monList.className = 'mon-list in ' + (self.next ? 'next' : 'prev')
				}, 16)
			})
        } else {
			this.monList = this.el.querySelector('.mon-list')
		    this.updateMonth(this.activeYear, this.activeMonth)
        }
	
	}
	updateMonth() {
        let tempDate
        let dayOfWeek

        /* Back fill 
            - If the first day of this month is not the beginning of a week (Sunday), 
                then back fill the days of that week with the days of last month
        */
        tempDate = moment(this.activeDate).startOf('month')
        dayOfWeek = tempDate.day()
        if (dayOfWeek > 0) { // If that day is not Sanday
            tempDate.subtract(dayOfWeek, 'days')
            for (let i = 0; i < dayOfWeek; i++) {
                this.drawDay(tempDate)
                tempDate.add(1, 'days')
            }
        }

        /* Draw month */
        const totalDays = this.activeDate.daysInMonth() // Get total dates of this month
        for (let i = 0; i < totalDays; i ++) {
            this.drawDay(tempDate)
            tempDate.add(1, 'days')
        }
        
        /* Forward fill 
            - If the last day of this month is not the end of a week (Saturday), 
              then forward fill the next days of that week with days of next month
        */
        dayOfWeek = tempDate.day()
        if (dayOfWeek > 0) {
            for (let i = dayOfWeek; i < 7; i++) {
                this.drawDay(tempDate)
                tempDate.add(1, 'days')
            }
        }
	}
	drawDay(m) {
        let self = this
    
        /* Create a Week div 
        If there's no week div or when starting a new week */
        if (this.monList.childNodes.length == 0 || m.day() === 0) {
            this.week = createElement('div', 'week')
            this.monList.appendChild(this.week)
        }

        /* Day Number */
        let number = createElement('div', 'day-number', m.date())

        /* Day Classify */
        let classes = ['day']
        // Classify by Month
        if (m.month() !== this.activeDate.month()) {
            classes.push('other-month')
        } else {
            classes.push('active-month')
        }
        // Classify by Day
        const diff_days = m.diff(today, 'days')
        if (diff_days == 0) {
            classes.push('today')
        } else if (diff_days < 0) {
            classes.push('before-today')
        } else {
            classes.push('after-today')
        }

        /* Day sub detail */
        let dayLunar = Lunar.fromDate(m.toDate())
        let daySolar = Solar.fromDate(m.toDate())
        let sub = createElement('div', 'day-sub')
        // Day in Chinesee
        let dayChinese
        let jiqei = dayLunar.getJieQi()
        if (jiqei) {
            dayChinese = createElement('div', 'day-ch jieqi', jiqei)
        } else {
            if (dayLunar.getDay() == 1) {
                dayChinese = createElement('div', 'day-ch lunar-first', dayLunar.getMonthInChinese()+'月')
            } else {
                dayChinese = createElement('div', 'day-ch', dayLunar.getDayInChinese())
            }
        }
        // Festival
        let festival = dayLunar.getFestivals() + daySolar.getFestivals()
        let dayFestival = createElement('div', 'day-festival', festival)
        

        // Outer Day
        let outer = createElement('div', classes.join(' '))
        outer.addEventListener(
            'click', 
            function() {self.choseDay(this)}
        )
        outer.setAttribute('date', m.date())
        outer.setAttribute('month', m.month())
        outer.setAttribute('year', m.year())
        outer.appendChild(number)
        sub.appendChild(dayChinese)
        sub.appendChild(dayFestival)
        outer.appendChild(sub)
        this.week.appendChild(outer)
    }

    /** Chose a date */
    choseDay(el) {
        if (this.chosenDateEl) {
            this.chosenDateEl.classList.remove('chosen')
        }
        this.chosenDateEl = el
        el.classList.add('chosen')
        this.dayDropDown(el)

        this.chosenDate = new Date(el.getAttribute('year'), el.getAttribute('month'), el.getAttribute('day'))
        let chosenYear = this.legend.querySelector('chosen-year')
        let chosenMonth = this.legend.querySelector('chosen-month')
        let chosenDay = this.legend.querySelector('chosen-day')
        let lunarDay = Lunar.fromDate(this.chosenDate)
    }
    /** Drop-down */
    dayDropDown(el) {

        var details, arrow
        var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent
        var day = new Date(this.activeDate.getFullYear, this.activeDate.getMonth, 12).getDate()
    
        /** Check if there already exist an open detail box */
        var currentDetailBox = document.querySelector('.details')

        if (currentDetailBox) {
            if (el.classList.contains("detailed")) {
                /** If the clicked date is for the current opened detailed box
                 *  - simply close it and end this method
                */
                currentDetailBox.addEventListener(
                    'webkitAnimationEnd', 
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox)}
                )
                currentDetailBox.addEventListener(
                    'oanimationend',
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox)}
                )
                currentDetailBox.addEventListener(
                    'msAnimationEnd', 
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox)}
                )
                currentDetailBox.addEventListener(
                    'animationend', 
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox)}
                )
                currentDetailBox.className = 'details out'
                el.classList.remove("detailed")
                return
    
            } 
                
            /** If there's already an opened detail box */
            // Remove "detailed" class from current detailed date
            let currentDetailedDate = document.querySelector('.detailed')
            if (currentDetailedDate) { currentDetailedDate.classList.remove("detailed")}

            if(currentDetailBox.parentNode === el.parentNode) {
                /** If the detaied box is on a same row as the clicked date 
                 *  - Change the arrow 
                */
                details = currentDetailBox
                arrow = document.querySelector('.arrow')
                arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px'
            } else {
                /**If the detaied box is on a different row from the clicked date 
                 * - Close it and create another one
                */
                currentDetailBox.addEventListener(
                    'webkitAnimationEnd', 
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox)}
                )
                currentDetailBox.addEventListener(
                    'oanimationend',
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox)}
                )
                currentDetailBox.addEventListener(
                    'msAnimationEnd', 
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox)}
                )
                currentDetailBox.addEventListener(
                    'animationend', 
                    function() {currentDetailBox.parentNode.removeChild(currentDetailBox)}
                )
                currentDetailBox.className = 'details out'
            }
        }

        // Add "detailed" class to current selection "
        el.classList.add("detailed")

        if (!currentDetailBox || currentDetailBox.parentNode != el.parentNode) {

            /** Create the Details Container */
            details = createElement('div', 'details in')
            /* Create the arrow */
            var arrow = createElement('div', 'arrow')
            arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px'

            details.appendChild(arrow)
            el.parentNode.appendChild(details)
        }
    
        //Create the event wrapper

        // var todaysEvents = this.events.reduce(function(memo, ev) {
        //     if(ev.date.isSame(day, 'day')) {
        //         memo.push(ev)
        //     }
        //     return memo
        // }, [])
    
        // this.renderEvents(todaysEvents, details)
    
    }
    
    /** Switch Month */
    nextMonth() {
        this.activeDate.add(1, 'month')
        this.activeMonth = this.activeDate.month()
        this.activeYear = this.activeDate.year()
        this.next = true
        this.update()
    }
    prevMonth() {
        this.activeDate.subtract(1, 'month')
        this.activeMonth = this.activeDate.month()
        this.activeYear = this.activeDate.year()
        this.next = false
        this.update()
    }
    /** Switch Year */
    nextYear() {
        this.activeDate.add(1, 'year')
        this.activeYear = this.activeDate.year()
        this.next = true
        this.update()
    }
    prevYear() {
        this.activeDate.subtract(1, 'year')
        this.activeYear = this.activeDate.year()
        this.next = false
        this.update()
    }

	static isYearLeap(year) {
		return year % 4 == 0 ? (year % 100 != 0 ? 1 : (year % 400 == 0 ? 1 : 0)) : 0
	}
}

const c = new Calendar()

var prevYear = function() {c.prevYear()}
var nextYear = function() {c.nextYear()}
var prevMonth = function() {c.prevMonth()}
var nextMonth = function() {c.nextMonth()}