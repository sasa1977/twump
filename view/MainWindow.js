Ext.ns('Xp','Xp.ui');

Xp.ui.Main = Ext.extend(Ext.Panel, {
	layout: 'anchor', 
	frame: true, 
	title: 'ExtPlayer',
	ctCls: 'xplayer-main',
	paused: false, 
	activeUrl: null,
	
	initComponent: function() {
		
		Xp.ui.Main.superclass.initComponent.call(this);

		air.NativeApplication.nativeApplication.addEventListener(air.Event.EXITING, this.onExiting.createDelegate(this));
		var root = Ext.air.NativeWindow.getRootWindow();
		root.addEventListener(air.Event.CLOSING, this.onClosing.createDelegate(this));
		root.alwaysInFront = true;
		root.addEventListener(air.Event.ACTIVATE, function(ev) {
			Ext.air.NativeWindowManager.each(function(win) {
				win.instance.orderToFront();						
			});
		});
	},
	
	appExit: function() {
		var exitingEvent = new air.Event(air.Event.EXITING, false, true);
		air.NativeApplication.nativeApplication.dispatchEvent(exitingEvent);
		if (!exitingEvent.isDefaultPrevented()) {
			air.NativeApplication.nativeApplication.exit();
		}
	},
	onExiting: function(exitEvent) {
		var winClosingEvent;
		Ext.air.NativeWindowManager.each(function(win) {
			winClosingEvent = new air.Event(air.Event.CLOSING, false, true);
			win.instance.dispatchEvent(winClosingEvent);
			if (!winClosingEvent.isDefaultPrevented()) {
				win.instance.close();
			} else {
				exitEvent.preventDefault();
			}
		});
	},
	onClosing: function(closeEvent) {
		this.appExit();
	}
});
Ext.reg('xp:ui:main', Xp.ui.Main);
