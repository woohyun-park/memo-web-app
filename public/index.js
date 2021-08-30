const firebaseConfig = {
  apiKey: "AIzaSyBwFWnjWz3CB11aeSi2W_nTAk30rThS5Uc",
  authDomain: "memowebapp-8a8cd.firebaseapp.com",
  databaseURL: "https://memowebapp-8a8cd-default-rtdb.firebaseio.com",
  projectId: "memowebapp-8a8cd",
  storageBucket: "memowebapp-8a8cd.appspot.com",
  messagingSenderId: "794565040861",
  appId: "1:794565040861:web:37b7697342a9da9d8b1934",
  measurementId: "G-KY0RF943KB"
};

//Init firebase
firebase.initializeApp(firebaseConfig);

let userInfo, selectedKey;

let auth = firebase.auth();
let authProvider = new firebase.auth.GoogleAuthProvider();
let database = firebase.database();

auth.onAuthStateChanged((user) => on_auth_state_changed(user));

function on_auth_state_changed(user){
    if(user){
        userInfo = user;
        get_memo_list();
    }else{
        auth.signInWithPopup(authProvider);
    }
}

function get_memo_list(){
  let memoRef = database.ref('memos/' + userInfo.uid);
  memoRef.on('child_added', on_child_added);
}

function get_data_one(key){
  selectedKey = key;
  let memoRef = database.ref('memos/' + userInfo.uid + '/' + key).once('value').then(function(snapshot){
    document.querySelector('.textarea').value = snapshot.val().txt;
  });
}

function on_child_added(data){
  window.get_data_one = get_data_one;

  let key = data.key;
  let memoData = data.val();
  let txt = memoData.txt;
  let title = txt.substr(0, txt.indexOf("\n"));
  let firstTxt = txt.substr(0, 1);

  let html =
    "<li id='"+key+"' class=\"collection-item avatar\" onclick=\"get_data_one(this.id);\" >" +
    "<i class=\"material-icons circle red\">" + firstTxt + "</i>" +
    "<span class=\"title\">" + title + "</span>" +
    "<p class='txt'>" + txt + "<br>" +
    "</p>" +
    "</li>";

    let collection = document.querySelector(".collection");
    collection.insertAdjacentHTML("beforeend", html);
}

function save_data(){
  let memoRef = database.ref('memos/' + userInfo.uid);
  let txt = document.querySelector('.textarea').value;
  if (txt === ''){
    return ;
  }if(selectedKey){
    memoRef = database.ref('memos/' + userInfo.uid + '/' + selectedKey);
    memoRef.update({
      txt: txt,
      createDate : new Date().getTime(),
      updateDate : new Date().getTime()
    });
    const elem = document.querySelector(`#${selectedKey}`);
    elem.querySelector(".txt").innerHTML = txt;
    elem.querySelector(".title").innerHTML = txt.substr(0, txt.indexOf("\n"));
  }else{
    memoRef.push({
      txt : txt,
      createDate : new Date().getTime()
    });
  }
}

document.querySelector('.textarea').addEventListener('blur', save_data);

