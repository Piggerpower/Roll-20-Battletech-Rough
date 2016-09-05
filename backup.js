var charIds = [];
on("ready",function(){
    ResetGame();
});
on("add:graphic",function(obj){
    ResetGame(obj.get("represents"));
})

function ResetGame(charId)
{
    if(charId==undefined)charId="all";
    charIds = [];
    charIds.length = 0;
    if(charId=="all")
    {
        var characters = findObjs({
            _type: "character"
        });
    }
    else
    {
        var characters = findObjs({
            _type: "character",
            _id: charId
        });
    }
    var oldIds = findObjs({
        _type:"attribute",
        name: "globalId"
    });
    for(var i = 0;i<oldIds.length;i++)
    {
        oldIds[i].remove();
    }
    for(var i = 0;i<characters.length;i++)
    {
        charIds.length++;
        charIds[charIds.length-1] = characters[i].id;
        createObj("attribute",{
            name: "globalId",
            current: charIds.length-1,
            characterid: characters[i].id
        });
        var token = findObjs({
            _type:"graphic",
            _subtype: "token",
            represents: characters[i].id
        })[0];
    }
}

var battle = [null,null];
on("chat:message",function(msg){
    var wrds = msg.content.split('.');
    if(wrds[0]=="!")
    {
        if(wrds.length<2) return;
        switch(wrds[1])
        {
            case "r" :
                ResetGame();
                break;
            case "c" :
                if(wrds.length!=5)return;
                var a = GetToken(charIds[wrds[2]]);
                var b = GetToken(charIds[wrds[3]]);
                var nm = wrds[4].split(' ');
                nm = nm[0];
                if(a==undefined||b==undefined||nm==undefined)
                {
                    sendChat("","/em You done fucked up bro.")
                    return;
                }
                var w = GetWeapons(charIds[wrds[2]]);
                var d = Dis(a,b);
                var arc = Arc(a,b);
                barValues = parseInt(a.get("bar1_value"))+parseInt(b.get("bar2_value"));
                var pilotGun = GetAttribute(wrds[2],"Pilotgunnery");
                pilotGun = parseInt(pilotGun);
                if(isNaN(pilotGun))pilotGun = 4;
                var l = MakeCheck(charIds[wrds[2]],w,d,pilotGun+barValues,arc);
                sendChat(nm,"/em Weapon Check");
                sendChat(nm,arc);
                if(l.length>0)
                {
                    for(var i = 0;i<l.length;i++)sendChat("("+l[i][2]+") "+l[i][0],l[i][1].toString());
                    log("","/em You done fucked up bro.", w , d , arc)
                }
                else
                {
                    sendChat("","No Possible Weapons");
                    log("","/em You done fucked up bro.", w , d , arc)
                }
                break;
            case "h":
                if(wrds.length!=6)return;
                var a = GetToken(charIds[wrds[2]]);
                var b = GetToken(charIds[wrds[3]]);
                hitTable = GetAttribute(charIds[wrds[3]],"Pilot") == "Tank" ? vhitTable : ohitTable;
                var data = [];
                var nm = wrds[5].split(' ');
                nm = nm[nm.length-1];
                if(a==undefined||b==undefined||nm==undefined)
                {
                    sendChat("","/em You done fucked up bro.")
                    return;
                }
                var arc = Arc(b,a);
                data = wrds[4].split(',');
                if(data==undefined)return;
                var hitLocations = [];
                var weaponName = "Weapon";
                for(var i = 0;i<data.length;i++)
                {
                    var hc = data[i].split(':');
                    if(!isNaN(hc[0])&&!isNaN(hc[1]))
                    {
                        if(hc.length==3)
                        {
                            weaponName = hc[2];
                        }
                        var weaponType = CheckType(weaponName);
                        if(weaponType=="normal")
                        {
                            hitLocations.length++;
                            hitLocations[hitLocations.length-1] = [HitCheck(hc[0],arc),hc[1],weaponName];
                        }
                        else if(weaponType=="cluster")
                        {
                            hitLocations.length++;
                            hitLocations[hitLocations.length-1] = [ClusterCheck(weaponName,arc,hc[0]),hc[1],weaponName];
                        }
                    }
                }
                sendChat(nm,"/em HIT LOCATIONS");
                for(var i = 0;i<hitLocations.length;i++)
                {
                    sendChat("","/em "+hitLocations[i][2]);
                    for(var h=0;h<hitLocations[i][0].length;h++)
                    {
                        sendChat(hitLocations[i][0][h][0],(hitLocations[i][0][h][1]*hitLocations[i][1]).toString());
                    }
                }
                break;
            case "m":
                if(wrds.length!=4||isNaN(wrds[2]))return;
                var charId = charIds[parseInt(wrds[2])];
                CreateMacros(charId);
                sendChat("","/em AND GOD SAID, \"LET THERE BE MACROS!\"");
                break;
        }
    }
});

function CreateMacros(charId)
{
    weapons = GetWeapons(charId);
    var oldMacros = findObjs({
        _type: "ability",
        _characterid: charId
    });
    var macroNames = [];
    for(var i = 0;i<oldMacros.length;i++)
    {
        macroNames.length++;
        macroNames[macroNames.length-1] = oldMacros[i].get("name");
    }
    for(var i = 0;i<weapons.length;i++)
    {
        var name = getAtt(weapons[i],"Type");
        if(name!=undefined)
        {
            name = name.split('(')[0].trim();
        }
        var valid = true;
        for(var h = 0;h<macroNames.length;h++)
        {
            if(macroNames[h]==name)
            {
                valid = false;
            }
        }
        if(valid)
        {
            macroNames.length++;
            macroNames[macroNames.length-1] = name;
            var damage = 0;
            if(!isNaN(getAtt(weapons[i],"Dam")))
            {
                damage = parseInt(getAtt(weapons[i],"Dam"));
            }
            if(!isNaN(damage))
            {
                var macro = "!.h.@{selected|globalId}.@{target|globalId}.?{Number of Hits|1}:";
                macro += damage+":"+name+".@{target|token_name}";
                createObj("ability",{
                    name: name,
                    characterid: charId,
                    istokenaction: true,
                    action: macro
                });
            }
        }
    }
}

var hitTable;

var ohitTable =
    [
        ["f",
            [
                "Center Torso (Critical)",
                "Right Arm",
                "Right Arm",
                "Right Leg",
                "Right Torso",
                "Center Torso",
                "Left Torso",
                "Left Leg",
                "Left Arm",
                "Left Arm",
                "Head"
            ]
        ],
        ["l",
            [
                "Left Torso (Critical)",
                "Left Leg",
                "Left Arm",
                "Left Arm",
                "Left Leg",
                "Left Torso",
                "Center Torso",
                "Right Torso",
                "Right Arm",
                "Right Leg",
                "Head"
            ]
        ],
        ["r",
            [
                "Right Torso (Critical)",
                "Right Leg",
                "Right Arm",
                "Right Arm",
                "Right Leg",
                "Right Torso",
                "Center Torso",
                "Left Torso",
                "Left Arm",
                "Left Leg",
                "Head"
            ]
        ],
        ["b",
            [
                "Center Torso Rear (Critical)",
                "Right Arm",
                "Right Arm",
                "Right Leg",
                "Right Torso Rear",
                "Center Torso Rear",
                "Left Torso Rear",
                "Left Leg",
                "Left Arm",
                "Left Arm",
                "Head"
            ]
        ]
    ];
    var vhitTable =
    [
        ["f",
            [
                "Front (Critical)",
                "Front *",
                "Front *",
                "Right Side *",
                "Front",
                "Front",
                "Front",
                "Left Side *",
                "Turret",
                "Turret",
                "Turret (Critical)"
            ]
        ],
        ["l",
            [
                "Left Side (Critical)",
                "Left Side *",
                "Left Side *",
                "Front *",
                "Left Side",
                "Left Side",
                "Left Side (Critical)",
                "Rear *",
                "Turret",
                "Turret*",
                "Turret (Critical)"
            ]
        ],
        ["r",
            [
                "Right Side (Critical)",
                "Right Side *",
                "Right Side *",
                "Front *",
                "Right Side",
                "Right Side",
                "Right Side (Critical)",
                "Rear *",
                "Turret",
                "Turret*",
                "Turret (Critical)"
            ]
        ],
        ["b",
            [
                "Rear (Critical)",
                "Rear *",
                "Rear *",
                "Left Side *",
                "Rear",
                "Rear",
                "Rear",
                "Right Side *",
                "Turret",
                "Turret",
                "Turret (Critical)"
            ]
        ]
    ];
    

var clusterHitTable =
    [
        [1,1,1,1,2,2,3,3,3,4,4,4,5,5,5,5,6,6,6,7,7,7,8,8,9,9,9,10,10,12],
        [1,1,2,2,2,2,3,3,3,4,4,4,5,5,5,5,6,6,6,7,7,7,8,8,9,9,9,10,10,12],
        [1,1,2,2,3,3,4,4,4,5,5,5,6,6,7,7,8,8,9,9,9,10,10,10,11,11,11,12,12,18],
        [1,2,2,3,3,4,4,5,6,7,8,8,9,9,10,10,11,11,12,13,14,15,16,16,17,17,17,18,18,24],
        [1,2,2,3,4,4,5,5,6,7,8,8,9,9,10,10,11,11,12,13,14,15,16,16,17,17,17,18,18,24],
        [1,2,3,3,4,4,5,5,6,7,8,8,9,9,10,10,11,11,12,13,14,15,16,16,17,17,17,18,18,24],
        [2,2,3,3,4,4,5,5,6,7,8,8,9,9,10,10,11,11,12,13,14,15,16,16,17,17,17,18,18,24],
        [2,2,3,4,5,6,6,7,8,9,10,11,11,12,13,14,14,15,16,17,18,19,20,21,21,22,23,23,24,32],
        [2,3,3,4,5,6,6,7,8,9,10,11,11,12,13,14,14,15,16,17,18,19,20,21,21,22,23,23,24,32],
        [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,40],
        [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,40]
    ];
    
var chn = [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,40];

function CheckType(weapon)
{
    var type = "normal";
    var clusterType =
    [
        "HAG",
        "LRM",
        "SRM",
        "Rocket",
        "ATM",
        "MML",
        "LB"
    ];
    if(weapon.indexOf("Streak")==-1)
    {
        for(var i = 0;i<clusterType.length;i++)
        {
            if(weapon.indexOf(clusterType[i])!=-1)
            {
                type = "cluster";
            }
        }
    }
    return type;
}

function HitCheck(numRolls,arc)
{
    var returnHits = [];
    for(var i = 0;i<numRolls;i++)
    {
        var curTable = [];
        for(var h = 0;h<hitTable.length;h++)
        {
            if(arc==hitTable[h][0])
            {
                curTable = hitTable[h][1];
            }
        }
        var spotIndex = randomInteger(6)-1+randomInteger(6)-1;
        var spot = curTable[spotIndex];
        returnHits.length++;
        returnHits[returnHits.length-1] = spot;
    }
    returnHits = MergeItems(returnHits);
    return returnHits;
}

function MergeItems(items)
{
    var returnHits = [];
    for(var i = 0;i<items.length;i++)
    {
        var index = 0;
        var valid = true;
        for(var h = 0;h<returnHits.length;h++)
        {
            if(returnHits[h][0]==items[i])
            {
                valid = false;
                index = h;
            }
        }
        if(valid)
        {
            returnHits.length++;
            returnHits[returnHits.length-1] = [items[i],1];
        }
        else
        {
            returnHits[index][1]++;
        }
    }
    return returnHits;
}

function ClusterCheck(weaponName,arc,amount)
{
    var hitLocations = [];
    var weaponNum = weaponName.split(' ')[1];
    if(weaponNum.split('-').length>1)
    {
        weaponNum = weaponNum.split('-')[0];
    }
    weaponNum = parseInt(weaponNum);
    if(isNaN(weaponNum)) weaponNum = 0;
    var clusterTypes = ["SRM","LB"];
    var clusterAmount = 5;
    for(var i = 0;i<clusterTypes.length;i++)
    {
        if(weaponName.indexOf(clusterTypes[i])!=-1)
        {
            clusterAmount = 1;
        }
    }
    for(var j = 0;j<amount;j++)
    {
        var spotIndex = randomInteger(6)-1+randomInteger(6)-1;
        var index = 0;
        for(var i = 0;i<chn.length;i++)
        {
            if(weaponNum==chn[i])
            {
                index = i;
            }
        }
        var hits = clusterHitTable[spotIndex][index];
        var r = hits%clusterAmount;
        hits -= r;     
        
        
        for(var i = 0;i<hits;i+=clusterAmount)
        {
            var currentHit = HitCheck(1,arc)[0][0];
            for(h=0;h<clusterAmount;h++)
            {
                hitLocations.length++;
                hitLocations[hitLocations.length-1] = currentHit;
            }
        }
        var currentHit = HitCheck(1,arc)[0][0];
        for(h=0;h<r;h++)
        {
            hitLocations.length++;
            hitLocations[hitLocations.length-1] = currentHit;
        }
    }
    hitLocations = MergeItems(hitLocations);
    return hitLocations;
}

function MakeCheck(charId,weapons,distance,additions,arc)
{
    var returnWeapons = [];
    var usedWeapons = [];
    for(var i = 0;i<weapons.length;i++)
    {
        var name = getAtt(weapons[i],"Type");
        var special = name.split('(')[1];
            
        if(special!=undefined) special = special.split(')')[0];
        else special = "";
        
        var rear = special.indexOf("R") != -1;
        var location = getAtt(weapons[i],"Loc");
        var quantityNum = 1;
        var quantity = getAtt(weapons[i],"Qty");
        
        var rightArmShot = GetAttribute(charId,"RA13")=="Lower Arm Actuator";
        var leftArmShot = GetAttribute(charId,"LA13")=="Lower Arm Actuator";
        
        if(quantity!=undefined&&!isNaN(quantity))
        {
            quantityNum = parseInt(quantity);
        }
        
        if(location!=undefined)
        {
            leftArm = location=="Left Arm";
            rightArm = location=="Right Arm";
            torso = location.split(' ')[1] == "Torso";
        }
        else
        {
            leftArm = false;
            rightArm = false;
            torso = false;
        }
        var valid = true;
        for(var h = 0;h<usedWeapons.length;h++)
        {
            if(usedWeapons[h][0]==[name,leftArm,rightArm,torso,rear].join())
            {
                valid = false;
                usedWeapons[h][1]+=quantityNum;
            }
        }
        if(valid)
        {
            var min = getAtt(weapons[i],"Min");
            var short = getAtt(weapons[i],"Sht");
            var med = getAtt(weapons[i],"Med");
            var long = getAtt(weapons[i],"Lng");
            var modifier = additions;
            
            var useable = special.indexOf("B") == -1;
            if(min!=null&&short!=null&&med!=null&&long!=null)
            {
                if(distance<=min)
                {
                    modifier += min - distance + 1;
                }
                else if(distance<=short)
                {
                    modifier += 0;
                }
                else if(distance<=med)
                {
                    modifier += 2;
                }
                else if(distance<=long)
                {
                    modifier += 4;
                }
                else if(distance>long)
                {
                    useable = false;
                }
                if(modifier>=12)
                {
                    useable = false;
                }
                if(rear&&"flr".indexOf(arc)!=-1)
                {
                    useable = false;
                }
                if(!rear&&"b".indexOf(arc)!=-1)
                {
                    useable = false;
                }
                if((leftArm||torso)&&"r".indexOf(arc)!=-1)
                {
                    useable = false;
                }
                if((rightArm||torso)&&"l".indexOf(arc)!=-1)
                {
                    useable = false;
                }
                if(rightArm&&"r".indexOf(arc)!=-1&&!rightArmShot)
                {
                    useable = false;
                }
                if(leftArm&&"l".indexOf(arc)!=-1&&!leftArmShot)
                {
                    useable = false;
                }
                if(useable)
                {
                    usedWeapons.length ++;
                    usedWeapons[usedWeapons.length-1] = [[name,leftArm,rightArm,torso,rear].join(),quantityNum];
                    returnWeapons.length++;
                    returnWeapons[returnWeapons.length-1] = [name,modifier,usedWeapons.length-1];
                }
            }
        }
    }
    var weaponNames = [];
    for(var i = 0;i<returnWeapons.length;i++)
    {
        returnWeapons[i][2] = usedWeapons[returnWeapons[i][2]][1];
    }
    for(var i = 0;i<returnWeapons.length;i++)
    {
        var valid = true;
        for(var h = 0;h<weaponNames.length;h++)
        {
            if(weaponNames[h]!=undefined&&weaponNames[h][0]==returnWeapons[i][0])
            {
                valid = false;
                weaponNames[h][2] += returnWeapons[i][2];
            }
        }
        if(valid)
        {
            weaponNames.length++;
            weaponNames[weaponNames.length-1] = returnWeapons[i];
        }
    }
    return weaponNames;
}

function getAtt(array,str)
{
    for(var i = 0;i<array.length;i++)
    {
        if(array[i][0]==str)
        {
            return array[i][1];
        }
    }
    return null;
}

function GetToken(characterId)
{
    return findObjs({
        _type: "graphic",
        _subtype: "token",
        represents: characterId
    })[0];
}

function GetWeapons(attackerId)
{
    var all = findObjs({
        _type: "attribute",
        _characterid: attackerId
    });
    var weapons = [];
    var vn =
        [
            "Qty",
            "Type",
            "Loc",
            "Ht",
            "Hit",
            "Dam",
            "Min",
            "Sht",
            "Med",
            "Lng"
        ];
    for(var i = 0;i<all.length;i++)
    {
        var ca = all[i].get('name');
        for(var h = 0;h<vn.length;h++)
        {
            if(ca.indexOf(vn[h])!=-1)
            {
                weapons.length++;
                weapons[weapons.length-1]=all[i];
            }
        }
    }
    var curWeap = [];
    var weaponIds = [];
    for(var i = 0;i<weapons.length;i++)
    {
        if(weapons[i].get('name').indexOf(vn[1])!=-1)
        {
            var weaponId = weapons[i].get('name').split(vn[1]);
            var weaponIdMend = weaponId.join("");
            var valid = true;
            for(var h = 0;h<weaponIds.length;h++)
            {
                if(weaponIdMend==weaponIds[h])
                {
                    valid = false;
                }
            }
            if(valid)
            {
                weaponIds.length++;
                weaponIds[weaponIds.length-1] = weaponIdMend;
            }
        }
    }
    for(var i = 0;i<weaponIds.length;i++)
    {
        var newWeap = [];
        for(var h = 0;h<vn.length;h++)
        {
            for(var j = 0;j<weapons.length;j++)
            {
                if(weapons[j].get('name').indexOf(vn[h])!=-1)
                {
                    var weapId = weapons[j].get('name').split(vn[h]);
                    if(weapId.join("")==weaponIds[i])
                    {
                        newWeap.length++;
                        if(vn[h]=="Type"||vn[h]=="Loc")
                        {
                            newWeap[newWeap.length-1] = [vn[h],weapons[j].get('current')];
                        }
                        else
                        {
                            newWeap[newWeap.length-1] = [vn[h],parseInt(weapons[j].get('current'))];
                        }
                    }
                }
            }
        }
        curWeap.length++;
        curWeap[curWeap.length-1] = newWeap;
    }
    return curWeap;
}

function Arc(source,destination)
{
    var rotation = (source.get("rotation")+90)%360-180;
    if(rotation==-180)rotation *= -1;
    var cS = [source.get("top"),source.get("left")];
    var cD = [destination.get("top"),destination.get("left")];
    var direction = Math.round(Math.atan2(cD[0]-cS[0],cD[1]-cS[1])/Math.PI*180/2)*2;
    var calculated = direction-rotation;
    if(calculated>180)calculated-=360;
    if(calculated<-180)calculated+=360;
    var side = "r";
    if(calculated<0)side="l";
    var spot = "";
    calculated = Math.abs(calculated);
    if(calculated<=61)
    {
        spot = "f";
    }
    else if(calculated<=121)
    {
        spot = side;
    }
    else
    {
        spot = "b";
    }
    return spot;
}

function GetAttribute(id,attName)
{
    var r = findObjs({
        _type: "attribute",
        _characterid: id,
        name: attName
    })[0];
    if(r!=undefined)return r.get('current');
}

function Dis(token1, token2) {
    if (token1.get('pageid') != token2.get('pageid')) {
        return;
    }
	
	var distance;
	
	var page = getObj('page', token1.get('pageid'));
	var gridType = page.get('grid_type');
	
	switch(gridType) {
		case 'hex':
			distance = hexVDistance([token1.get("left"), token1.get("top")], [token2.get("left"), token2.get("top")]);
			break;
		case 'hexh':
			distance = hexHDistance([token1.get("left"), token1.get("top")], [token2.get("left"), token2.get("top")]);
			break;
	}
	
	return distance;
}

function hexHDistance(unit1, unit2) {
	var q1, q2, r1, r2;
    q1 = Math.round((unit1[0] - 46.48512749037782) / 69.58512749037783);
    r1 = Math.round((unit1[1] - 39.8443949917523) / 39.8443949917523);
    r1 = Math.floor(r1 / 2);
    q2 = Math.round((unit2[0] - 46.48512749037782) / 69.58512749037783);
    r2 = Math.round((unit2[1] - 39.8443949917523) / 39.8443949917523);
    r2 = Math.floor(r2 / 2);
	
	return cubeDistance(oddQToCube(q1, r1), oddQToCube(q2, r2));
}

function hexVDistance(unit1, unit2) {
	var q1, q2, r1, r2;
    q1 = Math.round((unit1[0] - 37.59928099223013) / 37.59928099223013);
    r1 = Math.round((unit1[1] - 43.86582782426834) / 66.96582782426833);
    q1 = Math.floor(q1 / 2);
    q2 = Math.round((unit2[0] - 37.59928099223013) / 37.59928099223013);
    r2 = Math.round((unit2[1] - 43.86582782426834) / 66.96582782426833);
    q2 = Math.floor(q2 / 2);
	
	return cubeDistance(oddRToCube(q1, r1), oddRToCube(q2, r2));
}

function oddRToCube(q, r) {
	var x, y, z;
	x = q - (r - (r & 1)) / 2;
	z = r;
	y = -x - z;
	
	return [x, y, z];
}

function oddQToCube(q, r) {
	var x, y, z;
	x = q;
	z = r - (q - (q & 1)) / 2;
	y = -x - z;
	
	return [x, y, z];
}

function cubeDistance(cube1, cube2) {
	return Math.max(Math.abs(cube1[0] - cube2[0]), Math.abs(cube1[1] - cube2[1]), Math.abs(cube1[2] - cube2[2]));
}
