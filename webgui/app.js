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
    },
    btnMouseUp: function() {
        console.log("Mouse Up");
    },
    btnMouseDown: function() {
        console.log("Mouse Down");
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

const ws2=new WebSocket("ws://localhost:1880/ws/bridge");

ws2.onopen=function(event) {
    console.log("WebSocket Bridge aperto");
}

const vm2 = new Moon({
  el: "#miaroot2",
  data: {
    statoPulsante: "-"
  },
  methods: {
    ledOn: function() {
        ws2.send("4|LED=1");
    },
    ledOff: function() {
        ws2.send("4|LED=0");
    },
  }
});

ws2.onmessage=function(event) {
    var msg=event.data;
    var parts=msg.split("|");

    if(parts.length<2) return;

    switch (parts[0]) {
        case "4":
            switch(parts[1]){
                case "BTN=0":
                    vm2.set("statoPulsante","OFF");
                    break;

                case "BTN=1":
                    vm2.set("statoPulsante","ON");
                    break;
            }
            break;
    
        default:
            break;
    }
    
}