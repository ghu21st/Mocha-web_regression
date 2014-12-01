
var source;
var events =  [
        // an escalated session is assigned to the agent
        "assigned",
        // an escalated session assigned to the agent is canceled
        "canceled"
    ];

// handles the callback for data messages without event specified
// we call a special callback eventReceived for backward compatibility
var handleCallback = function (msg) {
    if (typeof (eventReceived) === "function") {
        eventReceived(msg.data, msg.data);
    }
};

// handles errors on the sse connection
// it is used as kind of a timer for server alive with 2000 ms period
// we re-create the EventSource object every 2 seconds until the server comes back
var errorCallback = function (e)
{
    source.close();
    delete window.source;
    setTimeout(setSourceCallbacks, 2000);
};

// this creates the SSE object and registers the callbacks for the different events
// that are already coded in the page that includes this js file
// the event names are predefined in the events array
var setSourceCallbacks = function()
{
    source = new EventSource('sse?agentId='+agentId);
    events.forEach( function(event) {
        var callback = window[event + "Received"];
        if (typeof window[event + "Received"] === "function") {
            source.addEventListener(event, callback, false);
        }
    });
    source.onmessage = handleCallback;
    source.onerror = errorCallback;
};

setSourceCallbacks();
