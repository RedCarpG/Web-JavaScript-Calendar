var $tiangan = [ "癸","甲","乙","丙","丁","戊","己","庚","辛","壬" ];
var $dizhi = [ "亥","子","丑","寅","卯","辰","巳","午","未","申","酉","戌" ];
// 1911年月干
var $yuegan1911 = [ "庚","辛","壬","癸","甲","乙","丙","丁","戊","己" ];
var $jie = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', 'XIAO_HAN', 'LI_CHUN'];
var $ssShorter = {
	'比肩': '比',
	'劫财': '劫',
	'正印': '印',
	'偏印': '枭',
	'正官': '官',
	'七杀': '杀',
	'正财': '财',
	'偏财': '才',
	'伤官': '伤',
	'食神': '食',
};

// 天干地支留意
var liuyi = [
	['甲己', '合土'],
	['乙庚', '合金'],
	['丙辛', '合水'],
	['丁壬', '合木'],
	['戊癸', '合火'],

	['甲庚', '冲'],
	['乙辛', '冲'],
	['丙壬', '冲'],
	['丁癸', '冲'],

	['巳申', '合化水'],
	['辰酉', '合化金'],
	['卯戌', '合化火'],
	['寅亥', '合化木'],
	['子丑', '合化土'],
	['午未', '合化火或土'],

	['申子辰', '合化水'],
	['寅午戌', '合化火'],
	['亥卯未', '合化木'],
	['巳酉丑', '合化金'],

	['亥子丑', '汇聚北方水'],
	['寅卯辰', '汇聚东方木'],
	['巳午未', '汇聚南方火'],
	['申酉戌', '汇聚西方金'],

	['子卯', '为无礼之刑'],
	['丑未戌', '为恃势之刑'],
	['寅巳申', '为无恩之刑'],
	['辰辰', '为自刑'],
	['午午', '为自刑'],
	['酉酉', '为自刑'],
	['亥亥', '为自刑'],

	['子午', '相冲'],
	['卯酉', '相冲'],
	['寅申', '相冲'],
	['巳亥', '相冲'],
	['辰戌', '相冲'],
	['丑未', '相冲'],

	['子未', '相害'],
	['丑午', '相害'],
	['寅巳', '相害'],
	['卯辰', '相害'],
	['申亥', '相害'],
	['酉戍', '相害'],

	['寅午', '暗合土'],
	['子巳', '暗合火'],
	['巳酉', '暗合水'],
	['卯申', '暗合金'],
	['亥午', '暗合木'],

	['子酉', '相破'],
	['寅亥', '相破'],
	['卯午', '相破'],
	['辰丑', '相破'],
	['巳申', '相破'],
	['未戌', '相破']
];

function getWuxing(tgdz)
{
	switch(tgdz)
	{
	case "子":wh="水";break;
	case "亥":wh="水";break;
	case "寅":wh="木";break;
	case "卯":wh="木";break;
	case "巳":wh="火";break;
	case "午":wh="火";break;
	case "申":wh="金";break;
	case "酉":wh="金";break;
	case "辰":wh="土";break;
	case "戌":wh="土";break;
	case "丑":wh="土";break;
	case "未":wh="土";break;
	case "甲":wh="木";break;
	case "乙":wh="木";break;
	case "丙":wh="火";break;
	case "丁":wh="火";break;
	case "戊":wh="土";break;
	case "己":wh="土";break;
	case "庚":wh="金";break;
	case "辛":wh="金";break;
	case "壬":wh="水";break;
	case "癸":wh="水";break;
	}
	return wh;
}

function getWuxingClass(wuxing) {
    let class_ 
    switch (wuxing) {
        case "金": class_ = 'jin'; break;
        case "木": class_ = 'mu'; break;
        case "水": class_ = 'shui'; break;
        case "火": class_ = 'huo'; break;
        case "土": class_ = 'tu'; break;
    }
    return class_
}
function renderGanZhi(el, gan, zhi) {
    let divGan = el.firstElementChild
    let divZhi = el.lastElementChild
    divGan.innerText = gan
    divZhi.innerText = zhi
    divGan.classList.add(getWuxingClass(getWuxing(gan)))
    divZhi.classList.add(getWuxingClass(getWuxing(zhi)))
}