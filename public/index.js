// Basic config information that firebase gives
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

// Initialize firebase
firebase.initializeApp(firebaseConfig);

// Initialize firebase components
let auth = firebase.auth();
let database = firebase.database();
let authProvider = new firebase.auth.GoogleAuthProvider();
let userInfo, selectedKey;

// If auth success, save userInfo and call get_memo_list() which loads and displays memos
// If not, sighin popup will appear
auth.onAuthStateChanged(function(user){
  if(user){
      userInfo = user;
      get_memo_list();
  }else{
      auth.signInWithPopup(authProvider);
  }
});

// Add all necessary eventListener
window.onload = function(){
  document.querySelector('.textarea').addEventListener('blur', save_data);
  document.querySelector('.fixed-action-btn').addEventListener('click', initMemo);
}

// Load memo data from database and call on_child_added() which adds memos as DOM element
function get_memo_list(){
  let memoRef = database.ref('memos/' + userInfo.uid);
  memoRef.on('child_added', on_child_added);
}

// Add data as DOM element to the page
function on_child_added(data){
  // ???
  // onclick event does not recognize functions in js file.
  // Therefore, I added required functions to window element to make it work.
  // Any better ways to do it?
  window.fn_get_data_one = fn_get_data_one;
  window.fn_delete_data = fn_delete_data;

  let key = data.key;
  let memoData = data.val();
  let txt = memoData.txt;
  let title = txt.substr(0, txt.indexOf("\n"));
  let firstTxt = txt.substr(0, 1);

  let html =
    `<li id='${key}' class="collection-item avatar" onclick="fn_get_data_one(this.id);" >
    <i class="material-icons circle red">${firstTxt}</i>
    <span class="title">${title}</span>
    <p class='txt'>${txt}<br>
    </p>
    <a href="#!" onclick="fn_delete_data('${key}')" class="secondary-content"><i class="material-icons">grade</i></a>
    </li>`;

  let collection = document.querySelector(".collection");
  collection.insertAdjacentHTML("beforeend", html);
}

// Change selected key and loads data from database and displays the data on textarea
function fn_get_data_one(key){
  selectedKey = key;
  let memoRef = database.ref(`memos/${userInfo.uid}/${key}`).once('value').then(function(snapshot){
    if(snapshot.val())
        document.querySelector('.textarea').value = snapshot.val().txt;
  });
}

// Remove data from database and memo DOM element from document, then make textarea null by calling initMemo()
function fn_delete_data(key){
    if(!confirm('삭제하시겠습니까?')){
        return ;
    }
    let memoRef = database.ref(`memos/${userInfo.uid}/${key}`);
    memoRef.remove();
    document.querySelector(`#${key}`).remove();
    initMemo();
}

function fn_update_data(selectedKey, txt){
  const elem = document.querySelector(`#${selectedKey}`);
  elem.querySelector(".txt").innerHTML = txt;
  elem.querySelector(".title").innerHTML = txt.substr(0, txt.indexOf("\n"));
}

// Make textarea and selectedKey null
function initMemo(){
  document.querySelector(".textarea").value = "";
  selectedKey = null;
}

// If selected key presents, make changes
// If not, save new data
function save_data(){
  let memoRef = database.ref('memos/' + userInfo.uid);
  let txt = document.querySelector('.textarea').value;
  if (txt === ''){
    return ;
  }else if(selectedKey){
    memoRef = database.ref(`memos/${userInfo.uid}/${selectedKey}`);
    memoRef.update({
      txt: txt,
      updateDate : new Date().getTime()
    });
    fn_update_data(selectedKey, txt);
  }else{
    memoRef.push({
      txt : txt,
      createDate : new Date().getTime()
    });
  }
}

