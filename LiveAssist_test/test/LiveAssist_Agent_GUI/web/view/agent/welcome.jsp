<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%--@elvariable id="agent" type="com.nuance.liveassist.server.agent.Agent"--%>
<!DOCTYPE html>
<html lang="en">
<head>
    <script type="text/javascript">
        var agentId = "${agent.id}";
        function assignedReceived(event) {
            window.location = 'sessionScreen?sessionId=' + event.data;
        }
    </script>
    <script type="text/javascript" src="/liveassist/view/agent/sse.js"></script>
    <script type="text/javascript" src="/liveassist/view/agent/time.js"></script>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title> Welcome agent </title>
    <meta name="description" content="">
    <link rel="stylesheet" type="text/css" media="screen, print, projection" href="/liveassist/view/agent/agent.css">
</head>
<body>
<div id="wrap">
    <div id="header"><h1> Hello agent ${agent.username}</h1></div>
    <div id="main" style="width:100%; height: auto">
        <div id="main_inner">
        <h2>No escalated session</h2>
        </div>
    </div>
    <div id="footer">
        <p> Escalated session queue is empty </p>
    </div>
</div>
</body>
</html>