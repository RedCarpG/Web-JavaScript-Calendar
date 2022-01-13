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

    const _legend = document.getElementById('legend')

    const _overview = _legend.querySelector('.overview')
    const _detail = _legend.querySelector('.detail')
    const _bot = _legend.querySelector('.bottom')
    const _clock = _bot.querySelector('.clock')

    let _date = moment()
    let _solarDate = Solar.fromDate(new Date())
    let _lunarDate = Lunar.fromDate(new Date())

    _bot.firstElementChild.innerText = _date.format("YYYY MMMM DD")
    _bot.lastElementChild.innerText = _lunarDate.getYearInChinese() + "年 " 
        + _lunarDate.getMonthInChinese() + "月 " + _lunarDate.getDayInChinese()


    const _update = function(d=null) {
        if (d) {
            _date = moment(d)
            _solarDate = Solar.fromDate(d)
            _lunarDate = Lunar.fromDate(d)
        }

        let year = _overview.querySelector('.year')
        let month = _overview.querySelector('.month')
        let date = _overview.querySelector('.date')
        let day = _overview.querySelector('.day')
        year.innerText = _date.format("YYYY")
        month.innerText = _date.format("MMMM")
        date.innerText = _date.format("DD")
        day.innerText = _date.format("ddd")

        let yearCh = _detail.querySelector('.year-chinese')
        let monthCh = _detail.querySelector('.month-chinese')
        let dayCh = _detail.querySelector('.day-chinese')
        let yearGZ = _detail.querySelector('.year-ganzhi')
        let monthGZ = _detail.querySelector('.month-ganzhi')
        let dayGZ = _detail.querySelector('.day-ganzhi')

        yearCh.innerText = _lunarDate.getYearInChinese() + " 年"
        monthCh.innerText = _lunarDate.getMonthInChinese() + " 月"
        dayCh.innerText = _lunarDate.getDayInChinese()

        renderGanZhi(yearGZ, _lunarDate.getYearGan(), _lunarDate.getYearZhi())
        renderGanZhi(monthGZ, _lunarDate.getMonthGan(), _lunarDate.getMonthZhi())
        renderGanZhi(dayGZ, _lunarDate.getDayGan(), _lunarDate.getDayZhi())

    }

    _update()

    _clock.innerText = moment().format("HH : mm : ss")
    setInterval(() => {
        _clock.innerText = moment().format("HH : mm : ss")
    }, 1000)


    return {
        Legend: {
            update: _update
        }
    }
})