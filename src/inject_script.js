if(document.getElementById('foreground') == null){
var foreground_entry_point = document.createElement('div');
let reactJS_script = document.createElement('script');

foreground_entry_point.id = 'foreground';

foreground_entry_point.appendChild(reactJS_script);

    console.log("appending foreground")
    document.querySelector("body").appendChild(foreground_entry_point);
}
