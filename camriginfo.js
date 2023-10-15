//It would be so useful in Aframe if you could move with the WASD keys / camera and press a key and it records the position of the camera rig. It would make it much easier to place cameras in that you can see exactly where it is and what it is looking at
AFRAME.registerComponent('camriginfo', {
multiple: true,
schema: {
	camera: {type: 'string', default: 'camera'},
	rig: {type: 'string', default: 'rig'},
	move: {type: 'string', default: 'null'},
	combine: {type: 'boolean', default: false},
	keys: {type: 'array', default: ['q','Q']},
},
init: function () {
	//Scene
	this.sceneEl = document.querySelector('a-scene'); 
	//Throttled Scene Loading Function
	this.watchRigThrottled = AFRAME.utils.throttle(this.watchRig, 1000, this);
	//Get Camera
	this.cameraEl = false;
	if(document.getElementById(this.data.camera)){
		this.cameraEl = document.getElementById(this.data.camera);
	} else {
		this.cameraEl = document.querySelector('a-camera');
	}
	//Camera Rotation Storage
	this.camRot = [];
	this.camQuat = [];

	//Get Rig
	this.rigEl = false;
	if(document.getElementById(this.data.rig)){
		this.rigEl = document.getElementById(this.data.rig);
	}
	//Rig Position Storage
	this.rigPos = [];

	//Get Movement Element
	this.moveEl = false;
	if(this.data.move !== 'null'){
		if(document.getElementById(this.data.move)){
			this.moveEl = document.getElementById(this.data.move);
		} else {
			this.moveEl = this.cameraEl;
		}
	}
	//Only allow record event to run once per button press
	this.toggled = {};

	//Records
	this.records = 0;
	this.all = [];

	//this.domEnt;

	//this.addEventListener('keydown',)

//Object.keys(this.toggled).includes(e.key)
	document.addEventListener('keydown', (e) => {
		//Keyboard Event Toggles to Record
		if(this.data.keys.includes(e.key)){
			//Key is being toggled
			if(this.toggled.hasOwnProperty(e.key)){
				return;
			} else {
				this.toggled[e.key] = true;
			}
			this.record();
		}
	})
	document.addEventListener('keyup', (e) => {
		//Keyboard Event Toggles to Record
		if(this.data.keys.includes(e.key)){
			//No longer being toggled
			delete this.toggled[e.key];
		}
	})

},
rigRotOffset: function (){
	//let quaternion = new THREE.Quaternion().copy( auxl.camera.GetEl().object3D.quaternion);
	let quaternion = new THREE.Quaternion().copy(this.cameraEl.object3D.quaternion);
	let bodyQuat = new THREE.Quaternion().copy(this.rigEl.object3D.quaternion);
	quaternion.multiply(bodyQuat);
	return quaternion;
},

record: function () {
	//Camera
	this.camRot.push(new THREE.Euler().copy(this.cameraEl.object3D.rotation));
	this.camQuat.push(new THREE.Quaternion().copy(this.cameraEl.object3D.quaternion));
	//this.camQuat.push(this.rigRotOffset());
	//if rig exists, grab rig position
	if(this.rigEl){
		this.rigPos.push(new THREE.Vector3().copy(this.rigEl.object3D.position));
	}
	//Add the camera offset to rig position
	if(this.data.combine){
		this.rigPos[this.rigPos.length-1].add(new THREE.Vector3().copy(this.cameraEl.object3D.position))
	}
	this.records++;
	this.reference();
},
reference: function () {
	//Build Element
	let ref = document.createElement('a-entity');
	ref.setAttribute('id', 'ref'+this.records);
	//Set Position
	let refPos = new THREE.Vector3().copy(this.rigPos[this.rigPos.length-1]);
	refPos.y += 1;
	ref.setAttribute('position', refPos);
	//Get Ref Rotation
	let refRot = new THREE.Quaternion().copy(this.camQuat[this.camQuat.length-1]);
	//Set Geometry
	ref.setAttribute('geometry', {primitive: 'plane', width: 3, height: 1});
	//Material
	ref.setAttribute('material', {shader: "standard", color: '#2694ce', emissive: '#2694ce', emissiveIntensity: 0.75, opacity: 0.75, side: 'double'});
	//Text
	let posText = 'Pos| x: '+refPos.x.toFixed(2)+ ' | y: '+refPos.y.toFixed(2)+ ' | z: '+refPos.z.toFixed(2)+'\nRot| x: '+refRot.x.toFixed(2)+ ' | y: '+refRot.y.toFixed(2)+ ' | z: '+refRot.z.toFixed(2)+' | w: '+refRot.w;
	ref.setAttribute('text', {value: posText, color: "#000000", align: "center", font: "exo2bold", zOffset: 0.005, side: 'front', wrapCount: 25, baseline: 'center', align: 'left', width: 2.75});
	//Look At
	ref.setAttribute('look-at', this.data.camera);
	ref.setAttribute('rigPos', this.rigPos.length-1);

	//Click Event
	ref.classList.add('clickable');
	ref.addEventListener('click',function() {
		//Get Component Info
		let comp = document.querySelector('a-scene').components.camriginfo;
		if(comp.moveEl){
			//move player to position
			let num = this.getAttribute('rigPos');
			let newPos = new THREE.Vector3().copy(comp.rigPos[num])
			let newRot = new THREE.Quaternion().copy(comp.camQuat[num])
			//newPos.y = 1.6;
			comp.moveEl.object3D.position.copy(newPos);
			//comp.rigEl.object3D.setRotationFromQuaternion(newRot);

		}
	})

	//Add to Scene
	this.sceneEl.appendChild(ref);
	//Get Element
	this.all.push(document.getElementById('ref'+this.records))
},
watchRig: function (time, timeDelta) {
	if(this.records > 0){
		this.rigCurrent = new THREE.Vector3().copy(this.rigEl.object3D.position);
		if(this.data.combine){
			this.rigCurrent.add(new THREE.Vector3().copy(this.cameraEl.object3D.position))
		}
		this.all.forEach(each => each.object3D.lookAt(this.rigCurrent))
	}
},
tick: function (time, timeDelta) {
	this.watchRigThrottled();

},
});
