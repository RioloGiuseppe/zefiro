console.log("Caricato app.js");

const ws=new WebSocket("ws://localhost:1880/ws/test");

ws.onopen=function(event) {
    console.log("WebSocket aperto");
    ws.send("Ciao, sono il browser e mi sono appena connesso!");
}

ws.onmessage=function(event) {
    console.log(event.data);
    vm.set("messaggio",event.data);
}

const vm = new Moon({
  el: "#miaroot",
  data: {
    saluto: "Ciao Moon!",
    messaggio: "Nessun messaggio"
  },
  methods: {
    inviaMessaggio: function() {
        var msg="Ciao sono le " + (new Date()).toLocaleTimeString();
        this.set("saluto",msg);
        ws.send(msg);
    }
  },
  computed: {
    reversedSaluto: {
      get: function() {
        return this.get("saluto").split(" ").reverse().join(" ");
      }
    }
  },
  hooks: {
    init: function() {
      // called when first creating
      console.log("init chiamata");
    },
    mounted: function() {
      // called when element is mounted and the first build has been run
    },
    updated: function() {
      // called every time data is updated
    },
    destroyed: function() {
      // called when it is destroyed, the component might be removed
      // from the DOM
    }
  }
});