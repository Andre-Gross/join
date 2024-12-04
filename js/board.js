
// This function searchs for the Pokemon names
function filterAndShowTask(){
    let filterWord = document.getElementById("idSearch").value; 
    
    if (filterWord.length >= 3) {
      let filterWordLow = filterWord.toLowerCase(); 
      currentNames = names.filter(name => name.name.toLowerCase().includes(filterWordLow));
      indexs =[]; 
  
      for (let i = 0; i < currentNames.length; i++) {
        let currentPokemon = currentNames[i]; 
        let index = names.findIndex(pokemon => pokemon.name === currentPokemon.name);  
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