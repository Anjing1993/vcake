(function ($) {
    $.core = {
        "version": "2010.4",
        defaultLang: "en",
        strRegIdSeries: "^\\d+(\\,\\d+)*$",
        strRegMobile: "^1[3458]\\d{9}$",
        strRegTel: "^((\\+)?\\d+\\-)?(\\(\\d+\\)|\\d+\\-)?\\d+(\\-\\d+)?$",
        strRegEmail: "^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$",
        strRegChs: "[\\u4e00-\\u9fa5]",
        strRegSpecialChar: "[\\x00-\\x2C\\x2F\\x3A-\\x40\\x5B-\\x5E\\x60\\x7B-\\xFF]",

        getText: function (text) {
            var textEn = {
                "close": "Close", "alert": "Alert"
            };
            var textCn = {
                "close": "关闭", "alert": "提示"
            };
            var str = eval('text' + this.defaultLang)[text];
            return typeof str == 'undefined' ? text : str;
        }
    };
    $.fn.extend({
        move: function (type, x, y) {
            if (typeof x != "number") x = 0; if (typeof y != "number") y = 0;
            var dw = $(window).width(); var dh = $(window).height();
            var st = $(document).scrollTop(); var sl = $(document).scrollLeft();
            var ow = $(this).width(); var oh = $(this).height();
            //alert("dw:" + dw + ",dh:" + dh + ",sl:" + sl + ",st:" + st + ",ow:" + ow + ",oh:" + oh);

            $(this).css("position", "absolute");
            var top, left;
            //设置left
            switch (type) {
                case 1: case 4: case 7:
                    left = x;
                    break;
                case 2: case 5: case 8:
                    left = sl + (dw - ow) / 2 + x;
                    break;
                case 3: case 6: case 9: default:
                    left = dw - sl - ow + x;
                    break;
            }
            //设置top
            switch (type) {
                case 1: case 2: case 3:
                    top = y;
                    break;
                case 4: case 5: case 6:
                    top = st + (dh - oh) / 2 + y;
                    break;
                case 7: case 8: case 9: default:
                    top = dh + st - oh + y;
                    break;
            }
            $(this).css({ 'top': top < 0 ? 0 : top, 'left': left < 0 ? 0 : left });
            return $(this);
        },
        resizeImage: function (width, height) {
            $(this).hide().css({ 'width': '', 'height': '' }).show();
            var imgWidth = $(this).width(), imgHeight = $(this).height();
            if (imgWidth > width || imgHeight > height) {
                var aimP = width / height;
                var imgP = imgWidth / imgHeight;
                var p2 = 1;
                if (imgP > aimP) {
                    p2 = width / imgWidth;
                    height = parseInt(imgHeight * p2);
                } else if (imgP < aimP) {
                    p2 = height / imgHeight;
                    width = parseInt(imgWidth * p2);
                }
                $(this).width(width).height(height);
            }
            return $(this);
        }
    });
})(jQuery);

var Validator = {
    /*验证类型*/
    phone: /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?(([1-9]\d{6,7})|(1[3458]\d{9}))(\-\d{1,4})?$/,
    mobile: /^((\(\d{3}\))|(\d{3}\-))?1[3458]\d{9}$/,
    url: /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/,
    currency: /^\d+(\.\d{1,2})?$/,
    number: /^\d+$/,
    zip: /^[1-9]\d{5}$/,
    qq: /^[1-9]\d{4,10}$/,
    integer: /^[-\+]?\d+$/,
    double: /^[-\+]?\d+(\.\d+)?$/,
    english: /^[A-Za-z]+$/,
    chinese: /^[\u0391-\uFFE5]+$/,
    username: /^[a-z]\w{3,}$/i,
    unsafe: /^(([A-Z]*|[a-z]*|\d*|[-_\~!@#\$%\^&\*\.\(\)\[\]\{\}<>\?\\\/\'\"]*)|.{0,5})$|\s/,
    domainname: /^[a-z0-9]+[a-z0-9\-]*[a-z0-9]+$/i,

    require: "value.trim()!=''",
    email: "value.isEmail()",
    idcard: "value.isIdCard()",
    safestring: "this.IsSafe(value)",
    filter: "this.DoFilter(value, getAttribute('accept'))",
    limit: "this.Limit(value.length,getAttribute('min'), getAttribute('max'))",
    limitb: "this.Limit(value.lenB(), getAttribute('min'), getAttribute('max'))",
    date: "value.isDate(getAttribute('format'))",
    repeat: "value == document.getElementById(getAttribute('to')).value",
    range: "getAttribute('min') < (value|0) && (value|0) < getAttribute('max')",
    compare: "this.Compare(value,getAttribute('operator'),getAttribute('to'))",
    custom: "value.test(getAttribute('regexp'),'g')",
    radiolist: "this.CheckRadioList(this.validateControls[i])",
    checkboxlist: "this.CheckCheckboxList(this.validateControls[i])",
    selectlist: "this.CheckSelectList(this.validateControls[i])",
    select: "selectedIndex >= getAttribute('min')",

    ErrorItem: [],
    ErrorMessage: [],
    validateControls: [],
    validate: function (mode, groupName) {
        this.validateControls.length = 0;
        this.ErrorItem.length = 0;
        this.ErrorMessage.length = 0;
        if (arguments.length < 2) groupName = "";
        groupName = groupName.toString().toLowerCase();
        var eles = document.getElementsByTagName("*");
        for (var i = 0; i < eles.length; i++) {
            var tag = eles[i].tagName.toUpperCase();
            var vgroup = "";
            if (tag == "INPUT" || tag == "SELECT" || tag == "TEXTAREA" || eles[i].getAttribute("v") != null) {
                vgroup = eles[i].getAttribute("vgroup") || "";
                if (vgroup.toLowerCase() == groupName) { this.validateControls[this.validateControls.length] = eles[i]; }
            }
        }
        var count = this.validateControls.length;
        for (var i = 0; i < count; i++) {
            with (this.validateControls[i]) {
                var _dataType = getAttribute("vtype");
                if (_dataType != null) _dataType = _dataType.toLowerCase();
                if (typeof (_dataType) == "object" || typeof (this[_dataType]) == "undefined") continue;
                this.ClearState(this.validateControls[i]);

                if (getAttribute("require") == "false" && value == "") continue;

                if (typeof this[_dataType] == "string") {
                    if (!eval(this[_dataType])) {
                        this.AddError(i, getAttribute("msg") == null ? "" : getAttribute("msg"));
                    }
                } else {
                    if (!this[_dataType].test(value)) {
                        this.AddError(i, getAttribute("msg") == null ? "" : getAttribute("msg"));
                    }
                }
            }
        }
        if (this.ErrorMessage.length > 0) {
            mode = mode || 0;
            var errCount = this.ErrorItem.length;
            switch (mode) {
                case 1:
                    alert(this.ErrorMessage[0].replace(/\d+:/, ''));
                    this.ErrorItem[0].focus();
                    break;
                case 2:
                    //附加错误时的样式
                    for (var i = 0; i < errCount; i++) {
                        var errClass = $(this.ErrorItem[i]).attr('ErrClass');
                        if (errClass != null) {
                            $(this.ErrorItem[i]).addClass(errClass);
                        }
                    }
                    this.ErrorItem[0].focus();
                    break;
                case 3:
                    //显示错误提示
                    for (var i = 0; i < errCount; i++) {
                        var tipCtrId = $(this.ErrorItem[i]).attr("ErrTipCtr");
                        if (tipCtrId != null && tipCtrId != '') {
                            $('#' + tipCtrId).show().html(this.ErrorMessage[i].replace(/\d+:/, ''));
                        }
                    }
                    this.ErrorItem[0].focus();
                    break;
                default:
                    alert(this.ErrorMessage.join("\n"));
                    this.ErrorItem[0].focus();
                    break;
            }
            return false;
        }
        return true;
    },
    IsSafe: function (str) {
        return !this.unsafe.test(str);
    },
    Limit: function (len, min, max) {
        min = min || 0;
        max = max || Number.MAX_VALUE;
        return min <= len && len <= max;
    },
    ClearState: function (elem) {
        //清除附加的错误样式(ErrClass)
        var errClass = $(elem).attr('ErrClass');
        if (errClass != null) {
            $(elem).removeClass(errClass);
        }
        //隐藏错误提示元素(ErrTipCtr)
        var tipCtrId = $(elem).attr("ErrTipCtr");
        if (tipCtrId != null && tipCtrId != '') {
            $(tipCtrId).hide();
        }
    },
    AddError: function (index, str) {
        this.ErrorItem[this.ErrorItem.length] = this.validateControls[index];
        this.ErrorMessage[this.ErrorMessage.length] = (this.ErrorMessage.length + 1).toString() + ":" + str;
    },
    Compare: function (op1, operator, op2) {
        switch (operator) {
            case "!=":
                return (op1 != op2);
            case ">":
                return (op1 > op2);
            case ">=":
                return (op1 >= op2);
            case "<":
                return (op1 < op2);
            case "<=":
                return (op1 <= op2);
            default:
                return (op1 == op2);
        }
    },
    DoFilter: function (input, filter) {
        return new RegExp("^.+\.(?=EXT)(EXT)$".replace(/EXT/g, filter.split(/\s*,\s*/).join("|")), "gi").test(input);
    },
    CheckSelectList: function (from) {
        var eles = from.getElementsByTagName("SELECT");
        var vlen = from.getAttribute("min");
        vlen = isNaN(vlen) || vlen == null || vlen < 0 ? eles.length : vlen;
        for (var i = 0; i < vlen; i++) {
            if (eles[i] == null || eles[i] == null || eles[i].style.display == "none") return true;
            if (eles[i].selectedIndex < 1) return false;
        }
        return true;
    },
    CheckCheckboxList: function (from) {
        var eles = from.getElementsByTagName("INPUT");
        var min = from.getAttribute("min");
        var max = from.getAttribute("max");
        min = (isNaN(min) || min == null) ? 0 : min;
        max = (isNaN(max) || max == null) ? eles.length : max;
        var cnt = 0;
        for (var i = 0; i < eles.length; i++) {
            if (eles[i].getAttribute("type").toLowerCase() == "checkbox") {
                cnt += eles[i].checked ? 1 : 0;
            }
        }
        return cnt >= min && cnt <= max;
    },
    CheckRadioList: function (from) {
        var eles = from.getElementsByTagName("INPUT");
        for (var i = 0; i < eles.length; i++) {
            if (eles[i].getAttribute("type").toLowerCase() == "radio" && eles[i].checked) {
                return true;
            }
        }
        return false;
    }
};

String.prototype.trim = function () {
    var reg = new RegExp("(^[\\s　]*)|([\\s　]*$)", "gim");
    return this.replace(reg, "");
};

String.prototype.format = function (args) {
    if (arguments.length < 1) return this;
    var str = this;
    for (var i = 0; i < arguments.length; i++) {
        var reg = new RegExp('\\{' + i.toString() + '\\}', 'gim');
        str = str.replace(reg, arguments[i].toString());
    }
    return str;
};

String.prototype.leftB = function (start, length) {
    if (arguments.length < 1) start = 0;
    if (arguments.length < 2) length = 0;
    var str = this;
    if (start < 1 && length < 1) return str;
    var rtn = "";
    var code = 0;
    for (var i = 0, j = 0, k = 0; i < str.length; i++) {
        code = str.charCodeAt(i);
        j += (code >= 0 && code <= 255) ? 1 : 2;
        if (j >= start) {
            if (length < 1 || k < length) {
                rtn += str.substr(i, 1);
                k += (code >= 0 && code <= 255) ? 1 : 2;
            }
        }
        if (length > 0 && k >= length) {
            break;
        }
    }
    return rtn;
};

String.prototype.lenB = function () {
    str = this;
    return str.replace(/[^\x00-\xff]/g, "**").length
};

String.prototype.regReplace = function (pattern, replaceText, regOptions) {
    if (arguments.length < 3) regOptions = "";
    var reg = new RegExp(pattern, regOptions);
    return this.replace(reg, replaceText);
};

String.prototype.test = function (regPattern, regOption) {
    if (arguments.length < 2) regOption = "";
    return new RegExp(regPattern, regOption).test(this);
};

String.prototype.clearSpace = function () {
    return this.replace(/[\s　]/gi, "");
};

String.prototype.clearHtmlTag = function () {
    var str = this.replace(/\<[^\<]+\>/gim, "");
    str = str.replace(/&[a-z]+;/gim, "");
    return str;
};

String.prototype.clearSpecialChar = function () {
    return this.regReplace(jQuery.core.strRegSpecialChar, "", "gim");
};

String.prototype.isEmail = function () {
    return this.test(jQuery.core.strRegEmail);
};

String.prototype.isIdCard = function (containOldVersion) {
    var number = this;
    var c = false;
    if (typeof containOldVersion != 'boolean') containOldVersion = false;
    var date, Ai;
    var verify = "10x98765432";
    var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    var area = ["", "", "", "", "", "", "", "", "", "", "", "北京", "天津", "河北", "山西", "内蒙古", "", "", "", "", "", "辽宁", "吉林", "黑龙江", "", "", "", "", "", "", "", "上海", "江苏", "浙江", "安微", "福建", "江西", "山东", "", "", "", "河南", "湖北", "湖南", "广东", "广西", "海南", "", "", "", "重庆", "四川", "贵州", "云南", "西藏", "", "", "", "", "", "", "陕西", "甘肃", "青海", "宁夏", "新疆", "", "", "", "", "", "台湾", "", "", "", "", "", "", "", "", "", "香港", "澳门", "", "", "", "", "", "", "", "", "国外"];
    var re = number.match(/^(\d{2})\d{4}(((\d{2})(\d{2})(\d{2})(\d{3}))|((\d{4})(\d{2})(\d{2})(\d{3}[x\d])))$/i);
    if (re == null) return false;
    if (re[1] >= area.length || area[re[1]] == "") return false;
    if (re[2].length == 12) {
        Ai = number.substr(0, 17);
        date = [re[9], re[10], re[11]].join("-");
    }
    else {
        if (!containOldVersion) return false;
        Ai = number.substr(0, 6) + "19" + number.substr(6);
        date = ["19" + re[4], re[5], re[6]].join("-");
    }
    if (!date.isDate("ymd")) return false;
    var sum = 0;
    for (var i = 0; i <= 16; i++) {
        sum += Ai.charAt(i) * Wi[i];
    }
    Ai += verify.charAt(sum % 11);
    return (number.length == 15 || number.length == 18 && number == Ai);
};

String.prototype.isNumeric = function () {
    return this.test("^(-)?\\d+(\\.\\d*)?$");
};

String.prototype.isCurrency = function () {
    return this.test("^(-)?\\d+(\\.\\d{0,2})?$");
};

String.prototype.isInteger = function () {
    return this.test("^(-)?\\d+$");
};

String.prototype.isPositiveNumeric = function (hasZero) {
    if (arguments < 1) {
        hasZero = true;
    }
    if (this.isNumeric() == false) {
        return false;
    }
    var num = parseFloat(this);
    return hasZero ? num >= 0 : num > 0;
};

String.prototype.isPositiveInteger = function (hasZero) {
    if (arguments < 1) {
        hasZero = true;
    }
    if (this.isInteger() == false) {
        return false;
    }
    var num = parseInt(this);
    return hasZero ? num >= 0 : num > 0;
};

String.prototype.isChineseAll = function () {
    return this.test("^[\\u4e00-\\u9fa5]*$");
};

String.prototype.hasSpecialChar = function () {
    return this.test(jQuery.core.strRegSpecialChar);
};

String.prototype.isDate = function (formatString) {
    var op = this;
    formatString = formatString || "ymd";
    var m, year, month, day;
    switch (formatString) {
        case "mdy":
            m = op.match(new RegExp("^(\\d{1,2})([-./])(\\d{1,2})\\2(\\d{4})$"));
            if (m == null) return false;
            month = m[1];
            day = m[3];
            year = m[4];
            break;
        case "dmy":
            m = op.match(new RegExp("^(\\d{1,2})([-./])(\\d{1,2})\\2(\\d{4})$"));
            if (m == null) return false;
            day = m[1];
            month = m[3];
            year = m[4];
            break;
        default:
            m = op.match(new RegExp("^(\\d{4})([-./])(\\d{1,2})\\2(\\d{1,2})$"));
            if (m == null) return false;
            year = m[1];
            month = m[3];
            day = m[4];
            break;
    }
    month = parseInt(month);
    if (isNaN(month)) return false;
    month = month == 0 ? 12 : month;
    var date = new Date(year, month - 1, day);
    return (typeof (date) == "object" && year == date.getFullYear() && month == (date.getMonth() + 1) && day == date.getDate());
};

//是否是润年
Number.prototype.isLeapYear = function () {
    var year = this;
    if ((year % 4) == 0) {
        if ((year % 100 == 0) && (year % 400) != 0) return false;
        else return true;
    }
    else return false;
};


//日期
Date.prototype.getDayName = function (lang) {
    lang = lang || 0;
    var dayname = [["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
					["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
					["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]];
    if (lang < 0 || lang >= dayname.length) lang = 0;
    return dayname[lang][this.getDay()];
};
Date.prototype.getMonthName = function (lang) {
    lang = lang || 0;
    var monthname = [["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
					  ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
					  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]];
    if (lang < 0 || lang >= monthname.length) lang = 0;
    return monthname[lang][this.getMonth()];
};
Date.prototype.isLeapYear = function () {
    return this.getFullYear().isLeapYear();
};
