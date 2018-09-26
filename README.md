# budgie-launcher-super
## idea/why
Basically i needed a command to switch tasks, given i'm used to the same functionality with windows. me tones more productive than tabbing.

Its simple switch to or launch window from tasklist by using super shortcuts
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
## API
```bash
# Super + 1
budgie-launcher-super 1
# Super + 2
budgie-launcher-super 2
# Super + 3
budgie-launcher-super 3
```

### --launch
Launch the task again despite window being open, handy to open an a new instance of `window 1` i've linked to `Shift + Super + 1`
```bash
budgie-launcher-super --launch 1
```