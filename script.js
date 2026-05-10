const search = document.getElementById("search");
const cards = document.querySelectorAll(".card");

search.addEventListener("input", () => {

  const value = search.value.toLowerCase();

  cards.forEach(card => {

    const title = card.innerText.toLowerCase();

    if(title.includes(value)){
      card.style.display = "block";
    }else{
      card.style.display = "none";
    }

  });

});
