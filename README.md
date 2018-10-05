# budgie-launcher-super
## idea/why
A simple script to switch tasks using `super + 1` number keys, the same feature exists with other desktops like windows and unity, this adds it to budgie desktop.


Example shortcut mappings
```
Super + 1 : windows 1
Super + 2 : windows 2
Super + 3 : windows 3
...9
```
I've looked at the source code for budgie-desktop, and to implement in valac, c is naturally hard me not knowing anything about c. And not being able to get a build of budgie-desktop running with my machine. So I've used nodejs

## Install
```
npm install -g budgie-launcher-super
```
### System Dependcies
`dconf, gtk-launch, xdotool, wmctrl`
I've also made a AUR package at https://aur.archlinux.org/packages/nodejs-budgie-launcher-super/

## API
```bash
# key bindings setup in keyboard shortcuts
budgie-launcher-super 1 # Super + 1
budgie-launcher-super 2 # Super + 2
budgie-launcher-super 3 # Super + 3
```

### --launch
Launch the task again despite window being open, handy to open an a new instance of `window 1` i've linked to `Shift + Super + 1`
```bash
budgie-launcher-super --launch 1
```

### command name
You can use an command name to switch to or launch that instance
```bash
budgie-launcher-super gnome-terminal
```