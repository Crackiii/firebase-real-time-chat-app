/******************************************************************
                         GENERAL SCRIPTS
*******************************************************************/
$(".show-login").click(function() {
    $(".user-signup").hide();
    $(".user-login").show();
})

$(".show-signup").click(function() {
    $(".user-login").hide();
    $(".user-signup").show();
})

/******************************************************************
                         MESSAGING SCRIPTS
*******************************************************************/

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDmkUcUO2a0iygoef_-G_se6zr9ytHON-o",
    authDomain: "my-work-book.firebaseapp.com",
    databaseURL: "https://my-work-book.firebaseio.com",
    projectId: "my-work-book",
    storageBucket: "my-work-book.appspot.com",
    messagingSenderId: "661474412916"
};
firebase.initializeApp(config);


//********************** USER AUTHENTICATION **********************

var _firbaseDB = firebase.database(),
    _storageDB = firebase.storage(),
    _storageRootRef = _storageDB.ref(),
    _firebaseRootRef = _firbaseDB.ref(),
    _firebaseAuthRef = _firbaseDB.ref("Auth/"),
    _firebaseChatRef = _firbaseDB.ref("Chats/"),
    _formData,
    _event,
    _CURRENT_USER,
    _REF_USER,
    _MESSAGES_LOCATION,
    _TOTAL_MESSAGES = [],
    _MESSAGES_KEYS = [],
    _LAST_MESSAGES = [],
    _LAST_MESSAGES_KEYS = [],
    _LAST_TIME = [],
    _CHATTED_WITH = [];


$("body").on("submit", ".auth-form", function(ev) {
    ev.preventDefault();
    var _event = ev.target;

    if ($(this).hasClass("auth-login")) {
        _formData = $(_event).serializeArray();
        loginAuth(_formData[0].value, _formData[1].value);
    }
    if ($(this).hasClass("auth-signup")) {
        _formData = $(_event).serializeArray();
        signupAuth(_formData[0].value, _formData[1].value, _formData[2].value);
    }

})



function signupAuth(name, email, pass) {
    firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then(function() {
            _CURRENT_USER = firebase.auth().currentUser.uid;
            $(".su-error").hide();
            $(".su-error").text("");
            $(".auth-signup").trigger("reset");
            $(".user-signup").hide();
            $(".su-welcome").show();
            $.cookie("_cu", _CURRENT_USER);
            setTimeout(function() {
                window.location.href = "chat.html"
            }, 2000);
            writeUserData(_CURRENT_USER, name, email);
        })
        .catch(function(error) {
            switch (error.code) {
                case "auth/invalid-email":
                    {
                        $(".su-error").show();
                        $(".su-error").text("Your Email is invalid !");
                        break;
                    }
                case "auth/email-already-in-use":
                    {
                        $(".su-error").show();
                        $(".su-error").text("Email already in use");
                        break;
                    }
            }
        });

    function writeUserData(id, name) {
        _firebaseAuthRef.child(id).set({
            n: name,
            e: email
        });
    }
}


function loginAuth(email, pass) {
    firebase.auth().signInWithEmailAndPassword(email, pass)
        .then(function(res) {
            _CURRENT_USER = firebase.auth().currentUser.uid;
            if (_CURRENT_USER) {
                $(".lg-error").hide();
                $(".lg-error").text("");
                $(".auth-login").trigger("reset");
                $(".user-login").hide();
                $(".lg-welcome").show();
                $.cookie("_cu", _CURRENT_USER);
                setTimeout(function() {
                    window.location.href = "chat.html"
                }, 2000);
            }
        })
        .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            $(".lg-error").show();
            $(".lg-error").text(errorCode);
        });

}

$(".logout").on("click", function(ev) {

    firebase.auth().signOut().then(function() {
        window.location.href = "auth.html";
        $.removeCookie("_cu");
        $.removeCookie("_to");
        $.removeCookie("_lo");
    }).catch(function(error) {

    });

})



//-------------------------------- LOAD THE CHAT LIST OF THE CURRENT USER


firebase.auth().onAuthStateChanged(function(user) {


    if (user && window.location.pathname == "/Fiverr/Firebase%20Chat%20App/chat.html") {


        _CURRENT_USER = $.cookie("_cu");


        let p = new Promise(function(res, rej) {
            _firebaseAuthRef.child(_CURRENT_USER + "/c").once("value").then(function(r) {
                let obj = r.val();
                for (x in obj) {
                    _CHATTED_WITH.push(x);
                    res(_CHATTED_WITH);
                }
            })

        })

        p.then(function(res) { getChatListMeta(res); });

    }
    else {
        // No user is signed in.
    }
});



function getChatListMeta(cw) {

            let len = cw.length,
                _el = document.getElementsByClassName("chat-ind-body-wrap")[0];


            let pr = new Promise(function(resolve, reject) {
                _firebaseAuthRef.child(_CURRENT_USER + "/c").on("value", function(res) {
                    let obj = res.val();
                    for (x in obj) {
                        _firebaseAuthRef.child(_CURRENT_USER + "/c/" + x + "/l/").on("value", function(rr) {
                            let ob = rr.val();
                            for (j in ob) {
                                _LAST_MESSAGES_KEYS.push(j);
                                resolve(_LAST_MESSAGES_KEYS);
                            }
                        })
                    }
                })
            })

            pr.then(function(result) {
                for (var i = 0; i < len; i++) {
                    _firebaseChatRef.child(result[i]).limitToLast(1).orderByChild("mess_time").on("child_added", function(re) {
                        _LAST_MESSAGES.push(re.val().mess);
                        _LAST_TIME.push(re.val().mess_time);
                    })
                }
                populateUsers();
            })

            function populateUsers() {



                for (let i = 0; i < len; i++) {
                    _firebaseAuthRef.child(cw[i]).on("value", function(res) {

                        if(_LAST_MESSAGES[i] && typeof _LAST_MESSAGES[i] === 'object'){
                            console.log("Fucked off");
                            if(_LAST_MESSAGES[i].type == 'image/jpeg'){
                                _el.insertAdjacentHTML('afterbegin', '<li class="chat-ind-user" data-id="' + cw[i] + '">' +
                                '<div class="chat-ind-user-img">' +
                                '<img src="assets/1.jpg">' +
                                '</div>' +
                                '<div class="chat-ind-user-data">' +
                                '<div class="ciu-name"> ' + res.val().n + ' </div>' +
                                '<div class="ciu-text"> <i class="fa fa-camera"></i> Image </div>' +
                                '<span class="ciu-time">' + _LAST_TIME[i] + '</span>' +
                                '</div>' +
                                '<span class="user-availble">' +
                                '<i class="fa fa-circle"></i>' +
                                '</span>' +
                                '</li>');
                            } else{
                                 _el.insertAdjacentHTML('afterbegin', '<li class="chat-ind-user" data-id="' + cw[i] + '">' +
                                '<div class="chat-ind-user-img">' +
                                '<img src="assets/1.jpg">' +
                                '</div>' +
                                '<div class="chat-ind-user-data">' +
                                '<div class="ciu-name"> ' + res.val().n + ' </div>' +
                                '<div class="ciu-text"> <i class="fa fa-paperclip"></i> File </div>' +
                                '<span class="ciu-time">' + _LAST_TIME[i] + '</span>' +
                                '</div>' +
                                '<span class="user-availble">' +
                                '<i class="fa fa-circle"></i>' +
                                '</span>' +
                                '</li>');
                            }
                        }
                        else{
                            console.log("Fucked off");
                            _el.insertAdjacentHTML('afterbegin', '<li class="chat-ind-user" data-id="' + cw[i] + '">' +
                                '<div class="chat-ind-user-img">' +
                                '<img src="assets/1.jpg">' +
                                '</div>' +
                                '<div class="chat-ind-user-data">' +
                                '<div class="ciu-name"> ' + res.val().n + ' </div>' +
                                '<div class="ciu-text">' + _LAST_MESSAGES[i] + '</div>' +
                                '<span class="ciu-time">' + _LAST_TIME[i] + '</span>' +
                                '</div>' +
                                '<span class="user-availble">' +
                                '<i class="fa fa-circle"></i>' +
                                '</span>' +
                                '</li>');
                        }
                    });

                }
            }
}

$(document).on("click", ".chat-ind-user", function() {

    $.cookie("_to", $(this).attr("data-id"));
    _REF_USER = $.cookie("_to");

    if ($(this).siblings().hasClass("active-user")) {
        $(this).siblings().removeClass("active-user");
        $(this).addClass("active-user");
        $(".messages-with-name span").text($(this).find(".ciu-name").text());
    } else if (!$(this).siblings().hasClass("active-user")) {
        $(this).addClass("active-user");
        $(".messages-with-name span").text($(this).find(".ciu-name").text());
    }


    let p = new Promise(function(res, rej) {
        _firebaseAuthRef.child(_CURRENT_USER + "/c/" + _REF_USER + "/l").once("value").then(function(r) {
            let obj = r.val();
            for (x in obj) {
                res(x);
            }
        })

    })

    p.then(function(res) {
        $.cookie("_lo", res);
        _MESSAGES_LOCATION =  $.cookie("_lo");
        _TOTAL_MESSAGES = [];
        _firebaseChatRef.child(_MESSAGES_LOCATION).orderByChild("mess_time").on("value", function(rr) {
            let obj = rr.val();
            for(x in obj){
                _TOTAL_MESSAGES.push(obj[x]);
            }
            populateUserMessages(_TOTAL_MESSAGES);
        })
    })

});


//-------------------------------- FILES SHARING WITH USERS
var _uploadBtn = document.getElementById("share-file"),
    _el = document.getElementsByClassName("files-list")[0],
    URLS = [], FILE_TYPE=[];


//Listen for file selection
_uploadBtn.addEventListener('change', function(e){

    //Get files
    for (var i = 0; i < e.target.files.length; i++) {
        var eFile = e.target.files[i];
        $(".files-list").show();
        _el.insertAdjacentHTML('beforeend','<li class="file-selected row">'+
                                                '<div class="col-3">'+eFile.name+'</div>'+
                                                '<div class="col-3">'+formatBytes(eFile.size,2)+'</div>'+
                                                '<div class="col-3 progress"><div class="progress-fill"></div></div>'+
                                                '<div class="col-3 status"> Uploading...</div>'+
                                              '</li>');
        uploadImageAsPromise(eFile,i);
    }

    function formatBytes(a,b){
        if(0==a) return"0 Bytes";
        var c=1024,
            d=b||2,
            e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],
            f=Math.floor(Math.log(a)/Math.log(c));
        return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f];
    }

    $(".close-files-list .fa").click(function(){
        while (_el.firstChild) {
            _el.removeChild(_el.firstChild);
        }
        $(".files-list").hide();
        URLS = [];
    })



});

//Handle waiting to upload each file using promise
function uploadImageAsPromise (eFile,i) {
    return new Promise(function (resolve, reject) {

        function makeid() {return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);}

        var storageRef = firebase.storage().ref($.cookie("_lo")+"/"+ (eFile.name+makeid()) );

        //Upload file
        var task = storageRef.put(eFile);

        //Update progress bar
        task.on('state_changed',
            function progress(snapshot){
                var percentage = snapshot.bytesTransferred / snapshot.totalBytes * 100;
                $(".progress .progress-fill").eq(i).css({"width":percentage+"%"});
            },
            function error(err){

            },
            function complete(){
                var downloadURL = task.snapshot.downloadURL,
                    metaData = task.snapshot.metadata.contentType;
                console.log(metaData);
                $(".status").eq(i).text("Completed");
                URLS.push(downloadURL);
                FILE_TYPE.push(metaData);
            }
        );
    });
}

$("body").on("submit", "#type-text-form", function(e) {
    e.preventDefault();
        _CURRENT_USER = $.cookie("_cu"),
        _REF_USER = $.cookie("_to"),
        _MESSAGES_LOCATION = $.cookie("_lo");
        let ev = e.target,
            tt = $(ev).serializeArray(),
            timestamp = Math.floor(Date.now() / 1000),
            _TOTAL_MESSAGES = [];



     if(URLS.length>0){
        _firebaseChatRef.child(_MESSAGES_LOCATION).push().set({
            mess_by: _CURRENT_USER,
            mess_to: _REF_USER,
            mess: {file:URLS,type:FILE_TYPE},
            mess_time: timestamp
        }).then(function() {
            $("#type-text-form").trigger("reset");
            populateUserMessages();
        });

     }

     else{
        _firebaseChatRef.child(_MESSAGES_LOCATION).push().set({
            mess_by: _CURRENT_USER,
            mess_to: _REF_USER,
            mess: tt[0].value,
            mess_time: timestamp
        }).then(function() {
            $("#type-text-form").trigger("reset");
            populateUserMessages();
        });

     }


})



function populateUserMessages() {

   let _el = document.getElementsByClassName("messages-body")[0];

   _TOTAL_MESSAGES = [];

   let p = new Promise(function(resolve,reject){
        _firebaseChatRef.child(_MESSAGES_LOCATION).orderByChild("mess_time").on("child_added",function(resa){
            _TOTAL_MESSAGES.push(resa.val());
            resolve(_TOTAL_MESSAGES);
        });
    })

    p.then(function(res){
        updateUI(res);
        URLS = [];
    })


    function updateUI(r){

        while (_el.firstChild) {
            _el.removeChild(_el.firstChild);
        }
        for(var i = 0;i<r.length;i++){
            if (r[i].mess_to == _CURRENT_USER) {

                if(r[i].mess.file && typeof r[i].mess.file === 'object' && r[i].mess.file.constructor === Array){

                    if(r[i].mess.type=="image/jpeg"){
                        for(var j = 0; j<r[i].mess.file.length;j++){
                            _el.insertAdjacentHTML("beforeend", '<div class="message message-from">' +
                            '<div class=" mess-img ">' +
                            '<div class="mess-img-wrap">' +
                            '<img src="assets/1.jpg" alt="img" >' +
                            '</div>' +
                            '</div>' +
                            '<div  class=" mess-body">' +
                            '   <div class="mess-txt">'+
                            '<img src="' + r[i].mess.file[j] + '">'+
                            '<a href="' + r[i].mess.file[j] + '" class="download-from-mess dfm-img dfm-frm" download> <i class="fa fa-cloud-download"></i> Download Image</a>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="mess-time">' +
                            '       ' + r[i].mess_time + '' +
                            '  </div>' +
                            '</div>');
                        }
                    } else{
                        for(var j = 0; j<r[i].mess.file.length;j++){
                            _el.insertAdjacentHTML("beforeend", '<div class="message message-from">' +
                            '<div class=" mess-img ">' +
                            '<div class="mess-img-wrap">' +
                            '<img src="assets/1.jpg" alt="img" >' +
                            '</div>' +
                            '</div>' +
                            '<div  class=" mess-body">' +
                            '   <div class="mess-txt">'+
                            '<a href="' + r[i].mess.file[j] + '" class="download-from-mess" download> <i class="fa fa-cloud-download"></i> Download File</a>' +
                            '</div>' +
                            '</div>' +
                            '<div class="mess-time">' +
                            '       ' + r[i].mess_time + '' +
                            '  </div>' +
                            '</div>');
                        }
                    }

                }
                else{
                    _el.insertAdjacentHTML("beforeend", '<div class="message message-from">' +
                    '<div class=" mess-img ">' +
                    '<div class="mess-img-wrap">' +
                    '<img src="assets/1.jpg" alt="img" >' +
                    '</div>' +
                    '</div>' +
                    '<div  class=" mess-body">' +
                    '<div class="mess-txt" id="cus-mess">' + r[i].mess + '</div>' +
                    '</div>' +
                    '<div class="mess-time">' +
                    '       ' + r[i].mess_time + '' +
                    '  </div>' +
                    '</div>');
                }
            } else {
                if(r[i].mess.file && typeof r[i].mess.file === 'object' && r[i].mess.file.constructor === Array){
                    if(r[i].mess.type=="image/jpeg"){
                        for(var j = 0; j<r[i].mess.file.length;j++){
                            _el.insertAdjacentHTML("beforeend", '<div class="message message-to">' +
                            '   <div class="mess-time">' +
                            '      ' + r[i].mess_time + '' +
                            ' </div>' +
                            '<div  class=" mess-body">' +
                            '<div class="mess-txt">'+
                            '<img src="' + r[i].mess.file[j] + '">'+
                            '<a href="' + r[i].mess.file[j] + '" class="download-from-mess dfm-img" download> <i class="fa fa-cloud-download"></i> Download Image</a>' +
                            '</div>' +

                            '</div>' +
                            ' </div>' +
                            '</div>');
                        }
                    } else{
                        for(var j = 0; j<r[i].mess.file.length;j++){
                            _el.insertAdjacentHTML("beforeend", '<div class="message message-to">' +
                            '<div class="mess-time">' +
                            '' + r[i].mess_time + '' +
                            ' </div>' +
                            '<div  class=" mess-body">' +
                            '<div class="mess-txt">'+
                            '<a href="' + r[i].mess.file[j] + '" class="download-from-mess" download> <i class="fa fa-cloud-download"></i> Download File</a>' +
                            '</div>' +
                            '</div>' +
                            ' </div>' +
                            '</div>');
                        }
                    }
                }
                else{
                    _el.insertAdjacentHTML("beforeend", '<div class="message message-to">' +
                    '<div class="mess-time">' +
                    '<div>' + r[i].mess_time + '</div>' +
                    ' </div>' +
                    '<div  class=" mess-body">' +
                    '   <div class="mess-txt">' + r[i].mess + '</div>' +
                    ' </div>' +
                    '</div>');
                }

            }
        }
        _el.scrollTo(0, document.body.scrollHeight);
    }





}

$(".new-mess button").on("click", function() {
    $(".chat-wrap-row .left-search").css({
        "margin-left": "0px"
    });
    $(".close-search").on("click", function() {
        $(".chat-wrap-row .left-search").css({
            "margin-left": "-1000px"
        });
    })
})

$("body").on("submit", ".search-from", function(e) {

    e.preventDefault();
    _event = e.target;
    let _searchFormData = $(_event).serializeArray(),
        _user = _searchFormData[0].value,

    _el = document.getElementsByClassName('searched-list')[0];

    while (_el.firstChild) {
        _el.removeChild(_el.firstChild);
    }

    _firebaseAuthRef.orderByChild("n").equalTo(_user).on("child_added", function(res) {

        let arr = [],
            key = [],
            obj = res.val();

        arr.push(res.val());
        key.push(res.key);

        for (let i = 0; i < arr.length; i++) {

            _el.insertAdjacentHTML('afterbegin', '<li class="searched-item" data-id="' + key[i] + '">' +
                '<span class="si-name"> ' + arr[i].n + ' </span>' +
                '<span class="si-email">' + arr[i].e + ' </span>' +
                '<span class="si-add"> <i class="fa fa-plus-circle"></i> </span>' +
                '</li>');
        }
    })

})

$("body").on("click", ".si-add", function(e) {

    let _REF_USER = $(this).parent().attr("data-id"),
        _chattedWith = [],
        _child_key = [];

    $(".chat-wrap-row .left-search").css({
        "margin-left": "-1000px"
    });

    _firebaseAuthRef.child(_CURRENT_USER).child("c").child(_REF_USER).child("l").push().set(true);

    let p = new Promise(function(res, rej) {
        _firebaseAuthRef.child(_REF_USER).once("value").then(function(r) {
            res({
                id: r.key,
                name: r.val().n
            });
        })

    })

    p.then(function(res) {
        populateUsers(res);
    })

    let p2 = new Promise(function(res, rej) {
        _firebaseAuthRef.child(_CURRENT_USER + "/c/" + _REF_USER + "/l").once("value").then(function(r) {
            let obj = r.val();
            for (x in obj) {
                res(x);
            }
        })

    })

    p2.then(function(res) {
        $.cookie("_lo", res);
        _firebaseAuthRef.child(_REF_USER).child("c").child(_CURRENT_USER).child("l").child(res).set(true);
    })

    function populateUsers(chattedWith) {

        let len = chattedWith.length,
            _el = document.getElementsByClassName("chat-ind-body-wrap")[0];

        console.log(chattedWith);

        _el.insertAdjacentHTML('afterbegin', '<li class="chat-ind-user" data-id="' + chattedWith.id + '">' +
            '<div class="chat-ind-user-img">' +
            '<img src="assets/1.jpg">' +
            '</div>' +
            '<div class="chat-ind-user-data">' +
            '<div class="ciu-name"> ' + chattedWith.name + ' </div>' +
            '<span class="ciu-time"> Now </span>' +
            '</div>' +
            '<span class="user-availble">' +
            '<i class="fa fa-circle"></i>' +
            '</span>' +
            '</li>');

    }



});
