function main(){
	var params = parseParams();
	if(Object.keys(params).length == 0){
		var info = document.createElement("p");
		info.innerHTML = "You need glossary terms! ";
		var a = document.createElement("a");
		a.href = "./index.html";
		a.innerHTML = "Head back";
		info.appendChild(a);
		info.innerHTML += " and search some terms.";
		document.body.insertBefore(info, document.getElementById("bottom"));
	}
	if(params["terms"] != null){
		var items = params["terms"].split(";");
		appendTermArray(items);
	}else if(params["eterms"] != null){
		var enc = params["eterms"];
		var str = atob(enc);
		var eitems = decodeURIComponent(str);
		//console.log(enc + " -> " + eitems + " (" + str + ")");
		appendTermArray(eitems.split(";"), true);
	}
}

function appendTermArray(items, encd = false){
	for(var i = 0; i < items.length; i++){
		var lcf = lowercaseFind(items[i]);
		if(lcf != null){
			appendTerm(lcf);
		}else{
			var info = document.createElement("p");
			info.id = "info";
			info.innerHTML = "Unknown term ";
			var strong = document.createElement("strong");
			strong.innerHTML = items[i];
			info.appendChild(strong);
			info.innerHTML += ". Did you mean";
			info.appendChild(document.createElement("br"));
			var tc = topCompares(items[i]);
			for(var j = 0; j < tc.length; j++){
				var str = "";
				for(var k = 0; k < i; k++){
					str += items[k] + ";";
				}
				str += tc[j] + ";"
				for(var k = i + 1; k < items.length; k++){
					str += items[k] + ";";
				}
				str = str.substring(0, str.length - 1);
				//console.log(tc[j] + ": " + str);
				var a = document.createElement("a");
				a.href = "./glossary.html?"
				if(!encd){
					a.href += "terms=" + encodeURIComponent(str);
				}else{
					a.href += "eterms=" + btoa(str);
				}
				a.innerHTML = tc[j];
				info.appendChild(a);
				info.appendChild(document.createElement("br"));
			}
			document.body.insertBefore(info, document.getElementById("bottom"));
		}
	}
}

function appendTerm(name){
	var h3 = document.createElement("h3");
	h3.innerHTML = name;
	document.body.insertBefore(h3, document.getElementById("bottom"));
	var desc = document.createElement("p");
	desc.innerHTML = parsedGlossary[name];
	document.body.insertBefore(desc, document.getElementById("bottom"));
}

function parseParams(){
	var url_string = window.location.href;
	var url = new URL(url_string);
	var params = {};
	url.searchParams.forEach(function(val, key){
		params[key] = val
	});
	return params;
}

function lowercaseFind(text){
	if(text == null || text == "")
		return null;
	var keys = Object.keys(parsedGlossary);
	for(var i = 0; i < keys.length; i++){
		if(text.toLowerCase() == keys[i].toLowerCase())
			return keys[i];
	}
	return null;
}

function topCompares(text, top = 3){
	var pG2 = Object.assign({}, parsedGlossary);
	var tops = [];
	for(var i = 0; i < top; i++){
		var curTop = compareAll(text, pG2);
		tops[i] = curTop;
		delete pG2[curTop];
	}
	return tops;
}

function compareAll(text, gloss = parsedGlossary){
	var record = Number.MIN_SAFE_INTEGER;
	var recordInd = -1;
	var keys = Object.keys(gloss)
	for(var i = 0; i < keys.length; i++){
		var testText = text;
		if(testText.length > keys[i].length){
			testText = testText.substring(0, keys[i].length);
		}
		if(testText.length < keys[i].length){
			testText = testText + keys[i].substring(testText.length);
		}
		var comp = similar(testText.toLowerCase(), keys[i].toLowerCase());
		//console.log(testText + " comp " + keys[i] + " = " + comp)
		if(Math.abs(comp) > record){
			//console.log("\tnew record")
			record = Math.abs(comp);
			recordInd = i;
		}
	}
	return keys[recordInd];
}

//https://stackoverflow.com/a/10473894/7075726
function similar(a, b) {
	var lengthA = a.length;
	var lengthB = b.length;
	var equivalency = 0;
	var minLength = (a.length > b.length) ? b.length : a.length;	
	var maxLength = (a.length < b.length) ? b.length : a.length;	
	for(var i = 0; i < minLength; i++) {
		if(a[i] == b[i]) {
			equivalency++;
		}
	}


	var weight = equivalency / maxLength;
	return (weight * 100);
}