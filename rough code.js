//********************** USER CHATS *****************************


















var convertTime = function(v, t) {
    var unixtimestamp = Math.floor(t),
        months_arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        date = new Date(unixtimestamp * 1000),
        year = date.getFullYear(),
        month = months_arr[date.getMonth()],
        day = date.getDate(),
        hours = date.getHours(),
        minutes = "0" + date.getMinutes(),
        seconds = "0" + date.getSeconds(),
        convdataTime = month + ' - ' + day + ' - ' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

    return convdataTime;
}






























