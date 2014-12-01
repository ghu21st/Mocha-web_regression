<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%--@elvariable id="session" type="com.nuance.liveassist.server.session.Session"--%>
<!DOCTYPE html>
<html lang="en">
<head>
    <script type="text/javascript">
        var agentId = "${agent.id}";
        function canceledReceived(event) {
            location.reload();
        }
    </script>
    <script type="text/javascript" src="/liveassist/view/agent/sse.js"></script>
    <script type="text/javascript" src="/liveassist/view/agent/time.js"></script>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title> Session with id ${session.id}</title>
    <meta name="description" content="">
    <link rel="stylesheet" type="text/css" media="screen, print, projection" href="/liveassist/view/agent/agent.css">
    <script src="/liveassist/view/agent/audio.js"></script>
</head>
<body>
<div id="wrap">
    <div id="header"><h1>Session with ID: ${session.id}</h1></div>
    <div id="main">
    <div id="main_inner">
        <h2>Session Information</h2>
        <p>ANI : ${session.ani}</p>
        <p>DNIS : ${session.dnis}</p>
        <p>Platform session ID : ${session.externalSessionID}</p>
        <c:if test="${not empty session.recognitionResult}">
	        <p>ASR results : <c:out value="${session.recognitionResult.length() < 450 ? session.recognitionResult : session.recognitionResult.substring(0, 450)}"/></p>  
    	</c:if>
        <c:if test="${not empty session.utterance}">
	        <p>Failed recognition utterance : </p>
	        <div id="uttLink">
	            <a href="${session.utterance}" target="audio">${session.utterance}</a>
	        </div>
	        <div id="uttPlayer">
	            <div>
	                <audio id="uttAudio" autoplay="autoplay" controls="controls">
	                    <source src="${session.utterance}"/> 
	                </audio>
	            </div>
	            <div>
	                Playback rate:
	                <input id="uttRateRange" type='range' min='0.5' max='2.5' value='1' step='.1'/>
	                <span id="uttRateValue"></span>
	            </div>
	        </div>
    	</c:if>
        <c:if test="${not empty session.audioStream}">
	        <div id="streamPlayer">
	            <div>
	                <audio id="streamAudio" controls="controls" preload="none">
	                    <source src="${session.audioStream}"/> 
	                </audio>
	            </div>
	            <div>
	                Playback rate:
	                <input id="streamRateRange" type='range' min='0.5' max='2.5' value='1' step='.1'/>
	                <span id="streamRateValue"></span>
	            </div>
	        </div>
    	</c:if>
    </div>
    </div>
    <div id="sidebar">
    <div id="sidebar_inner">
        <c:choose>
            <c:when test="${not empty session.viewName}">
                <jsp:include page="${session.viewName}"/>
            </c:when>
            <c:otherwise>
                <jsp:include page="picklistview.jsp"/>
            </c:otherwise>
        </c:choose>
    </div>
    </div>
    <div id="footer">
        <p>STATUS</p>
    </div>
</div>
</body>
</html>
