currentTasks = [];


// This function searchs for the Task name
function filterAndShowTask(){
    let filterWord = document.getElementById("idSearch").value; 
    
    if (filterWord.length >= 3) {
      console.log(tasksAsArray);
      let filterWordLow = filterWord.toLowerCase(); 
      currentTasks = tasksAsArray.filter(task => task.task.toLowerCase().includes(filterWordLow));
      console.log(currentTasks);
      console.log(tasksAsArray);
      indexs =[]; 
  
      for (let i = 0; i < currentTasks.length; i++) {
        let currentTask = currentTasks[i]; 
        let index = tasksAsArray.findIndex(pokemon => pokemon.name === currentTask.name);  
         indexs.push(index);  
      }  
      renderBodySearch();
    } else if (filterWord.length === 0) {
      location.reload();
    }
  }


async function renderBodySearch() {
    let content = document.getElementById("idContent");
    content.innerHTML = "";
  
    for (let i = 0; i < currentNames.length; i++) {
      let name = currentNames[i].name;
      await getTypes(name);
      let type1 = types[0].type;
      let type2 = "";
      if (types.length > 1) {type2 = types[1].type;}
  
      content = document.getElementById("idContent");
      content.innerHTML += getContentSearch(i, name, type1, type2);
      document.getElementById(`idCard${indexs[i]}`).classList.add(`type-${type1}`);
    }
  }