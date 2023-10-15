# aPlayerRef
An A-frame component to assist in retreiving in-scene data

A quickly put together component to help.

[Glitch Example Code](https://glitch.com/edit/#!/sophisticated-alabaster-stoat)

[Glitch Example](https://sophisticated-alabaster-stoat.glitch.me)

- Apply to a-scene

### Component Schema :

camera : the string id of you camera element. Default 'camera'

rig : the string id of your rig element if exists. Default 'rig'

move : A boolean that if enabled, on click will move the player to reference point. Default false

combine : A boolean that when toggled will combine your rig and camera position. Required if using default camera rig setup. Default false.

keys : An array of string keyboard characters that on click will add the reference info. Default: q, Q

