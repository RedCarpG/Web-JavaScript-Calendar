/** Get current date */
// var today = moment().startOf('day')
// var currentDate = today.date()
// var currentDay = today.day()
// var currentYear = today.year()
// var currentMonth = today.month()+1

;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof module != 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        var o = factory();
        for (var i in o) {
            root[i] = o[i];
        }
    }
})(this, function() {
    
    const _calendar = document.querySelector("#calendar")
    const _header = _calendar.querySelector('.header')
    const _year = _header.querySelector('.year')
    const _month = _header.querySelector('.month')

    let _monList = _calendar.querySelector('.mon-list')

    let activeDate = moment().startOf('day')
    let activeYear = function() {return activeDate.year()}
    let activeMonth = function() {return activeDate.month()}
    
    /** Get today's date */
    const Now = {
        today: () => {return moment().startOf('day')},
        year: () => {return moment().year()},
        month: () => {return moment().month()},
        date: () => {return moment().date()},
        day: () => {return moment().day()},
        hour: () => {return moment().hour()},
        minute: () => {return moment().minute()},
        second: () => {return moment().second()}
    }

    /** Closure of MonthList Element */
    const _MonthList = (function() {
        const _Detail = {
            updateDetail: function(detailEl, dayEl) {
                let arrow, events
                if (!detailEl.hasChildNodes()) {
                    arrow = createElement('div', 'arrow')
                    detailEl.appendChild(arrow)
        
                    events = createElement('div', 'events')
                    detailEl.appendChild(events)
                } else {
                    arrow = detailEl.firstChild
                    events = detailEl.lastChild
                }
        
                arrow.style.left = dayEl.offsetLeft - detailEl.parentNode.offsetLeft + 27 + 'px'
            },
            inDetail: function(detailEl) {
                detailEl.removeEventListener(
                    'webkitAnimationEnd', 
                    this.cbDetail 
                )
                detailEl.removeEventListener(
                    'oanimationend',
                    this.cbDetail 
                )
                detailEl.removeEventListener(
                    'msAnimationEnd', 
                    this.cbDetail 
                )
                detailEl.removeEventListener(
                    'animationend', 
                    this.cbDetail 
                )
            },
            outDetail: function(detailEl) {
                detailEl.addEventListener(
                    'webkitAnimationEnd', 
                    this.cbDetail 
                )
                detailEl.addEventListener(
                    'oanimationend',
                    this.cbDetail 
                )
                detailEl.addEventListener(
                    'msAnimationEnd', 
                    this.cbDetail 
                )
                detailEl.addEventListener(
                    'animationend', 
                    this.cbDetail 
                )
            },
            cbDetail: function() {
                this.innerHTML = ""
                this.className = 'detail hidden'
            },
        }

        /** _MonthList._updateMonth()
         * 
         * This method update the monList element by drawing a list of week elements
         * 
         * Note: 
         *  -   If the first day of this active month is not the beginning of a week (Sunday), 
         *      then back fill the days of that week with the days of last month
         *  -   If the last day of this active month is not the end of a week (Saturday),
         *      then forward fill the days of that week with the days of next month
        */ 
        const _updateMonth = function() {
            let tempDate

            tempDate = moment(activeDate).startOf('month')
            /* Check whether the first day of the month is Sunday */
            let firstDayOfWeek = tempDate.day()
            if (firstDayOfWeek > 0) tempDate.subtract(firstDayOfWeek, 'days')

            /* Draw week elements until first day of the week is in next month */
            while (tempDate.month() <= activeMonth()|| (activeMonth()==0 && tempDate.month()==11)) {
                _drawWeek(tempDate)
            }
        }
        /** _MonthList._drawWeek(date) 
         * 
         * This method draws one week element with 7 day-elements and a detail-element.
         * 
         * date: a moment() Object
        */
        const _drawWeek = function(date) {
            let day, week, detail

            week = createElement('div', 'week')
            _monList.appendChild(week)

            for (let i=0; i<7; i++) {
                day = _drawDay(date)
                week.appendChild(day)
                date.add(1, 'days')
            }
            detail = createElement('div', 'detail hidden')
            week.appendChild(detail)
        }
            
        /** _MonthList._drawDay(date) 
         * 
         * This method draws one day-element and classify the element.
         * 
         * date: a moment() Object
         * */
        const _drawDay = function(date) {
            /* Day Number */
            let number = createElement('div', 'day-number', date.date())
    
            /** Day Classify */
            let classes = ['day']
            // Classify by Month
            if (date.month() !== activeMonth()) {
                classes.push('other-month')
            } else {
                classes.push('active-month')
            }
            // Classify by Day
            const diff_days = date.diff(Now.today(), 'days')
            if (diff_days == 0) {
                classes.push('today')
            } else if (diff_days < 0) {
                classes.push('before-today')
            } else {
                classes.push('after-today')
            }
            if (date.day() == 0 || date.day() == 6) {
                classes.push('week-end')
            }
    
            /* Day sub detail */
            let dayLunar = Lunar.fromDate(date.toDate())
            let daySolar = Solar.fromDate(date.toDate())
            let sub = createElement('div', 'day-sub')
            // Day in Chinesee
            let dayChinese
            let jieqi = dayLunar.getJieQi()
            if (jieqi) {
                dayChinese = createElement('div', 'day-ch jieqi', jieqi)
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
            
    
            // Day element
            let day = createElement('div', classes.join(' '))
            day.addEventListener(
                'click', 
                () => {_dayDropDown(day)}
            )
            day.setAttribute('date', date.date())
            day.setAttribute('month', date.month())
            day.setAttribute('year', date.year())
            day.appendChild(number)
            sub.appendChild(dayChinese)
            sub.appendChild(dayFestival)
            day.appendChild(sub)
    
            return day
        }
        
        /** _MonthList._dayDropDown 
         * 
         * This method is the onclick callback function of a day element. It drops the detail-element.
        */
        const _dayDropDown = function(dayEl) {
            let detail
    
            /* Check if there already exist an open detail box */
            const currentDetail = document.querySelector('.detail.in')
            if (currentDetail) {
                if (dayEl.classList.contains("detailed")) {
                    /* If the clicked date is for the current opened detailed box */
                    dayEl.classList.remove("detailed")
                    _Detail.outDetail(currentDetail)
                    currentDetail.className = 'detail out'
                    return
                } 
                    
                /** If there's already an opened detail box different then the chosen date */
                // Remove "detailed" class from current detailed date
                let currentDetailedDate = document.querySelector('.detailed') 
                if (currentDetailedDate) currentDetailedDate.classList.remove("detailed")
    
                if(currentDetail.parentNode === dayEl.parentNode) {
                    /** If the detaied box is on a same row as the clicked date */
                    _Detail.updateDetail(currentDetail, dayEl)
                } else {
                    /* If the detaied box is on a different row from the clicked date */
                    _Detail.outDetail(currentDetail)
                    currentDetail.className = 'detail out'
                }
            }
    
            // Add "detailed" class to current selection "
            dayEl.classList.add("detailed")
            /** If there's no current detail box or the box is not on the same row 
             * Then create one
            */
            if (!currentDetail || currentDetail.parentNode != dayEl.parentNode) {
                detail = dayEl.parentNode.lastChild
                _Detail.inDetail(detail)
                _Detail.updateDetail(detail, dayEl)
                detail.className = 'detail in'
            }
        
        }

        const _animeOut = function(directionNext) {
            _monList.className = 'mon-list out ' + (directionNext ? 'next' : 'prev')
            _monList.addEventListener('webkitAnimationEnd', () =>{
                _monList.parentNode.removeChild(_monList)
                window.setTimeout(() => {
                    _animeIn(directionNext)
                }, 16)
            })
        }

        const _animeIn = function(directionNext) {
            _monList = createElement('div', 'mon-list')
            _calendar.appendChild(_monList)
            _monList.className = 'mon-list in ' + (directionNext ? 'next' : 'prev')
            _updateMonthList()
        }
        
        return {
            updateMonth: function() { _updateMonth() },
            dayDropDown: function(dayEl) { _dayDropDown(dayEl) },
            
            /** Switch Month */
            nextMonth: function() {
                activeDate.add(1, 'month')
                _animeOut(true)
            },
            prevMonth: function() {
                activeDate.subtract(1, 'month')
                _animeOut(false)
            },
            /** Switch Year */
            nextYear: function() {
                activeDate.add(1, 'year')
                _animeOut(true)
            },
            prevYear: function() {
                activeDate.subtract(1, 'year')
                _animeOut(false)
            }
        }
    })()

    /** Update function of Calendar */
    const _update = function(date=null) {
        if (date) {
            activeDate = moment(date).startOf('day')
        }

        // Update Header
        _year.innerText = activeYear()
        _month.innerText = activeDate.format('MMMM')
        if (Now.year() == activeYear()) {
            _year.classList.add('current')
            if (Now.month() == activeMonth() + 1) {
                _month.classList.add('current')
            } else {
                _month.classList.remove('current')
            }
        } else {
            _year.classList.remove('current')
            _month.classList.remove('current')
        }

        _MonthList.updateMonth(activeYear(), activeMonth())
    }

    /** Initializition Preperation */
    _update()

    let current = _calendar.querySelector('.today')
    if (current) {
        window.setTimeout(() => {
            _MonthList.dayDropDown(current)
        }, 500)
    }


    return {
        update: _update,
        nextMonth: _MonthList.nextMonth,
        prevMonth: _MonthList.prevMonth,
        /** Switch Year */
        nextYear: _MonthList.nextYear,
        prevYear: _MonthList.prevYear
    }
    // class Calendar {

    //     // static MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31]
        
    //     // static CH_NUM_CHAR = ["一","二","三","四","五","六","七","八","九","十","十一","十二"]	
    //     // static WEEK_TITLE_CH = ["周天","周一","周二","周三","周四","周五","周六"]
    //     // static WEEK_TITLE_EN = ["SUN","MON","TUE","WED","THU","FRI","SAT"]
    //     // static MONTH_CH = ["一月","二月","三月", "四月","五月","六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
    //     // static MONTH_EN = ["January","Febrary","March","April","May","June","July","Auguest","September","October","November","December"]
        
    //     // static _calendar = document.querySelector("#calendar")
    //     // static _header = this._calendar.querySelector('.header')
    //     // static _year = this._header.querySelector('.year')
    //     // static _month = this._header.querySelector('.month')
    
    //     constructor(selector="#calendar", events=[]) {
    //         this.el = document.querySelector(selector)
    //         this.events = events
    
    //         this.activeDate = moment().startOf('day')
    //         this.activeMonth = this.activeDate.month()
    //         this.activeYear = this.activeDate.year()
    //         // Initialize
    //         this.header = this.el.querySelector('.header')
    //         this.year = this.header.querySelector('.year')
    //         this.year.classList.add("current")
    //         this.month = this.header.querySelector('.month')
    //         this.month.classList.add("current")
    //         this._MonthList.monList = this.el.querySelector('.mon-list')
            
    //         this.update()
    
    //         let current = this.el.querySelector('.today')
    //         if (current) {
    //             let self = this
    //             window.setTimeout(function() {
    //                 self.choseDay(current)
    //             }, 500)
    //         }
    //     }
    
    //     update(date=null) {
    //         if (date) {
    //             this.activeDate = moment(date).startOf('day')
    //             this.activeMonth = this.activeDate.month()
    //             this.activeYear = this.activeDate.year()
    //         }
    
    //         // Update Header
    //         this.year.innerText = this.activeYear
    //         this.month.innerText = this.activeDate.format('MMMM')
    //         if (currentYear == this.activeYear) {
    //             this.year.classList.add('current')
    //             if (currentMonth == this.activeMonth + 1) {
    //                 this.month.classList.add('current')
    //             } else {
    //                 this.month.classList.remove('current')
    //             }
    //         } else {
    //             this.year.classList.remove('current')
    //             this.month.classList.remove('current')
    //         }
    
    //         this.updateMonth(this.activeYear, this.activeMonth)
    
    //         // Update Month List
    //         // if (this._MonthList.monList) {
    
    //         // 	this.oldList = this._MonthList.monList
    //         //     var oldList = this.oldList
    
    //         // 	this.oldList.className = 'mon-list out ' + (this.next ? 'next' : 'prev')
    //         // 	this.oldList.addEventListener('webkitAnimationEnd', this.switchMonth.bind(this.oldList))
                
    
    //         // 	// this.oldList = this._MonthList.monList
    //         //     // var oldList = this.oldList
    
    //         // 	// this.oldList.className = 'mon-list out ' + (this.next ? 'next' : 'prev')
    //         // 	// this.oldList.addEventListener('webkitAnimationEnd', () => {
    //         //     //     this.oldList.parentNode.removeChild(this.oldList)
    //         //     //     this._MonthList.monList = createElement('div', 'mon-list')
    //         //     //     this.el.appendChild(this._MonthList.monList)
    //         //     //     this.updateMonth(this.activeYear, this.activeMonth)
    
    //         //     //     window.setTimeout(() => {
    //         //     //         this._MonthList.monList.className = 'mon-list in ' + (this.next ? 'next' : 'prev')
    //         //     //     }, 16)
    //         //     // })
                
    //         // } else {
    //         // 	this._MonthList.monList = this.el.querySelector('.mon-list')
    //         //     this.updateMonth(this.activeYear, this.activeMonth)
    //         // }
        
    //     }
        
    //     /** Calendar.updateMonth()
    //      * 
    //      * This method update the monList element by drawing a list of week elements
    //      * 
    //      * Note: 
    //      *  -   If the first day of this active month is not the beginning of a week (Sunday), 
    //      *      then back fill the days of that week with the days of last month
    //      *  -   If the last day of this active month is not the end of a week (Saturday),
    //      *      then forward fill the days of that week with the days of next month
    //     */ 
    //     updateMonth() {
    //         let tempDate
    
    //         tempDate = moment(this.activeDate).startOf('month')
    //         /* Check whether the first day of the month is Sunday */
    //         let firstDayOfWeek = tempDate.day()
    //         if (firstDayOfWeek > 0) tempDate.subtract(firstDayOfWeek, 'days')
    
    //         /* Draw week elements until first day of the week is in next month */
    //         while (tempDate.month() <= this.activeMonth || (this.activeMonth==0 && tempDate.month()==11)) {
    //             this.drawWeek(tempDate)
    //         }
    
    //     }
    
    //     /** Calendar.drawWeek(date) 
    //      * 
    //      * This method draws one week element with 7 day-elements and a detail-element.
    //      * 
    //      * date: a moment() Object
    //     */
    //     drawWeek(date) {
    //         let day, week, detail
    
    //         week = createElement('div', 'week')
    //         this._MonthList.monList.appendChild(week)
    
    //         for (let i=0; i<7; i++) {
    //             day = this.drawDay(date)
    //             week.appendChild(day)
    //             date.add(1, 'days')
    //         }
    //         detail = createElement('div', 'detail hidden')
    //         week.appendChild(detail)
    //     }
    
    //     /** Calendar.drawDay(date) 
    //      * 
    //      * This method draws one day-element and classify the element.
    //      * 
    //      * date: a moment() Object
    //      * */
    //     drawDay(date) {
    //         let self = this
        
    //         /* Day Number */
    //         let number = createElement('div', 'day-number', date.date())
    
    //         /** Day Classify */
    //         let classes = ['day']
    //         // Classify by Month
    //         if (date.month() !== this.activeDate.month()) {
    //             classes.push('other-month')
    //         } else {
    //             classes.push('active-month')
    //         }
    //         // Classify by Day
    //         const diff_days = date.diff(today, 'days')
    //         if (diff_days == 0) {
    //             classes.push('today')
    //         } else if (diff_days < 0) {
    //             classes.push('before-today')
    //         } else {
    //             classes.push('after-today')
    //         }
    //         if (date.day() == 0 || date.day() == 6) {
    //             classes.push('week-end')
    //         }
    
    //         /* Day sub detail */
    //         let dayLunar = Lunar.fromDate(date.toDate())
    //         let daySolar = Solar.fromDate(date.toDate())
    //         let sub = createElement('div', 'day-sub')
    //         // Day in Chinesee
    //         let dayChinese
    //         let jieqi = dayLunar.getJieQi()
    //         if (jieqi) {
    //             dayChinese = createElement('div', 'day-ch jieqi', jieqi)
    //         } else {
    //             if (dayLunar.getDay() == 1) {
    //                 dayChinese = createElement('div', 'day-ch lunar-first', dayLunar.getMonthInChinese()+'月')
    //             } else {
    //                 dayChinese = createElement('div', 'day-ch', dayLunar.getDayInChinese())
    //             }
    //         }
    //         // Festival
    //         let festival = dayLunar.getFestivals() + daySolar.getFestivals()
    //         let dayFestival = createElement('div', 'day-festival', festival)
            
    
    //         // Day element
    //         let day = createElement('div', classes.join(' '))
    //         day.addEventListener(
    //             'click', 
    //             function() {self.choseDay(this)}
    //         )
    //         day.setAttribute('date', date.date())
    //         day.setAttribute('month', date.month())
    //         day.setAttribute('year', date.year())
    //         day.appendChild(number)
    //         sub.appendChild(dayChinese)
    //         sub.appendChild(dayFestival)
    //         day.appendChild(sub)
    
    //         return day
    //     }
    
    //     /** Chose a date */
    //     choseDay(el) {
    //         this.dayDropDown(el)
    
    //         // if (this.chosenDateEl) {
    //         //     this.chosenDateEl.classList.remove('chosen')
    //         // }
    //         // this.chosenDateEl = el
    //         // el.classList.add('chosen')
    
    //         // let chosenYear = this.legend.querySelector('chosen-year')
    //         // let chosenMonth = this.legend.querySelector('chosen-month')
    //         // let chosenDay = this.legend.querySelector('chosen-day')
    
    //         // let chosenDate = Solar.fromYmd(el.getAttribute('year'), el.getAttribute('month'), el.getAttribute('day')) 
    //         // let lunarDay = Lunar.fromDate(this.chosenDate)
    //         // chosenYear.innerText = this.chosenDate.getFullYear()
    //         // chosenMonth.innerText = this.chosenDate.get()
    //         // chosenDay.innerText = this.chosenDate.getFullYear()
    //     }
    //     /** Calendar.dayDropDown 
    //      * 
    //      * This method is the onclick callback function of a day element. It drops the detail-element.
    //     */
    //     dayDropDown(dayEl) {
    
    //         let detail, arrow
    
    //         /* Check if there already exist an open detail box */
    //         const currentDetail = document.querySelector('.detail.in')
    //         if (currentDetail) {
    //             if (dayEl.classList.contains("detailed")) {
    //                 /* If the clicked date is for the current opened detailed box */
    //                 dayEl.classList.remove("detailed")
    //                 this.outDetail(currentDetail)
    //                 currentDetail.className = 'detail out'
    //                 return
    //             } 
                    
    //             /** If there's already an opened detail box different then the chosen date */
    //             // Remove "detailed" class from current detailed date
    //             let currentDetailedDate = document.querySelector('.detailed') 
    //             if (currentDetailedDate) currentDetailedDate.classList.remove("detailed")
    
    //             if(currentDetail.parentNode === dayEl.parentNode) {
    //                 /** If the detaied box is on a same row as the clicked date */
    //                 this.updateDetail(currentDetail, dayEl)
    //                 // detail = currentDetail
    //                 // arrow = detail.querySelector('.arrow')
    //                 // arrow.style.left = dayEl.offsetLeft - dayEl.parentNode.offsetLeft + 27 + 'px'
    //             } else {
    //                 /* If the detaied box is on a different row from the clicked date */
    //                 this.outDetail(currentDetail)
    //                 currentDetail.className = 'detail out'
    //             }
    //         }
    
    //         // Add "detailed" class to current selection "
    //         dayEl.classList.add("detailed")
    //         /** If there's no current detail box or the box is not on the same row 
    //          * Then create one
    //         */
    //         if (!currentDetail || currentDetail.parentNode != dayEl.parentNode) {
    //             detail = dayEl.parentNode.lastChild
    //             this.inDetail(detail)
    //             this.updateDetail(detail, dayEl)
    //             detail.className = 'detail in'
    //         }
        
    //     }
    //     updateDetail(detailEl, dayEl) {
    //         let arrow, events
    //         if (!detailEl.hasChildNodes()) {
    //             arrow = createElement('div', 'arrow')
    //             detailEl.appendChild(arrow)
    
    //             events = createElement('div', 'events')
    //             detailEl.appendChild(events)
    //         } else {
    //             arrow = detailEl.firstChild
    //             events = detailEl.lastChild
    //         }
    
    //         arrow.style.left = dayEl.offsetLeft - detailEl.parentNode.offsetLeft + 27 + 'px'
    
    //     }
    //     inDetail(detailEl) {
    //         detailEl.removeEventListener(
    //             'webkitAnimationEnd', 
    //             this.cbDetail 
    //         )
    //         detailEl.removeEventListener(
    //             'oanimationend',
    //             this.cbDetail 
    //         )
    //         detailEl.removeEventListener(
    //             'msAnimationEnd', 
    //             this.cbDetail 
    //         )
    //         detailEl.removeEventListener(
    //             'animationend', 
    //             this.cbDetail 
    //         )
    //     }
    //     outDetail(detailEl) {
    //         detailEl.addEventListener(
    //             'webkitAnimationEnd', 
    //             this.cbDetail 
    //         )
    //         detailEl.addEventListener(
    //             'oanimationend',
    //             this.cbDetail 
    //         )
    //         detailEl.addEventListener(
    //             'msAnimationEnd', 
    //             this.cbDetail 
    //         )
    //         detailEl.addEventListener(
    //             'animationend', 
    //             this.cbDetail 
    //         )
    //     }
    //     cbDetail() {
    //         this.innerHTML = ""
    //         this.className = 'detail hidden'
    //     }
    
    
    //     _MonthList = {
    //         monList: null,
    //         animeOutMonth: function(directionNext) {
    //             console.log("This in animeOutMonth()", this)
    //             this.monList.className = 'mon-list out ' + (directionNext ? 'next' : 'prev')
    //             this.monList.addEventListener('webkitAnimationEnd', () =>{
    //                 console.log("This in webkitAnimationEnd", this)
    //                 this.monList.parentNode.removeChild(this.monList)
    //                 window.setTimeout(() => {
    //                     this.animeInMonth.bind(this, directionNext)()
    //                 }, 16)
    //             })
    //         },
    //         animeInMonth: function(directionNext) {
    //             console.log("This in animeInMonth()", this)
    //             this.monList = createElement('div', 'mon-list')
    //             Calendar._calendar.appendChild(this.monList)
    //             this.monList.className = 'mon-list in ' + (directionNext ? 'next' : 'prev')
    //             // Calendar.update()
    //         }
    //     }
    
    //     nextMonth() {
    //         this.activeDate.add(1, 'month')
    //         this.activeMonth = this.activeDate.month()
    //         this.activeYear = this.activeDate.year()
    
    //         this._MonthList.animeOutMonth(true)
    
    //     }
    //     prevMonth() {
    //         this.activeDate.subtract(1, 'month')
    //         this.activeMonth = this.activeDate.month()
    //         this.activeYear = this.activeDate.year()
    //         this.next = false
    //         this.update()
    //     }
    //     /** Switch Year */
    //     nextYear() {
    //         this.activeDate.add(1, 'year')
    //         this.activeYear = this.activeDate.year()
    //         this.next = true
    //         this.update()
    //     }
    //     prevYear() {
    //         this.activeDate.subtract(1, 'year')
    //         this.activeYear = this.activeDate.year()
    //         this.next = false
    //         this.update()
    //     }
    
    //     static isYearLeap(year) {
    //         return year % 4 == 0 ? (year % 100 != 0 ? 1 : (year % 400 == 0 ? 1 : 0)) : 0
    //     }
    // }
    
    // const c = new Calendar()
})
// var prevYear = function() {c.prevYear()}
// var nextYear = function() {c.nextYear()}
// var prevMonth = function() {c.prevMonth()}
// var nextMonth = function() {c.nextMonth()}