<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title> Done </title>
    <meta name="description" content="">

    <link rel="stylesheet" type="text/css" media="screen, print, projection" href="/liveassist/view/agent/agent.css">

    <script type="text/javascript">
        function timedRefresh() {
            <c:if test="${not empty timeout}">
            <c:if test="${not empty url}">
                setTimeout("window.location ='${url}';",${timeout});
            </c:if>
            <c:if test="${empty url}">
                setTimeout("location.reload(true);",${timeout});
            </c:if>
            </c:if>
        }
    </script>
</head>
<body onload="timedRefresh()">
<div id="wrap">
    <div id="header"><h1><c:out value="${headerMessage}" default="Done"/></h1></div>
    <div id="main" style="width:100%; height: auto">
        <div id="main_inner">
        <h2><c:out value="${operation}" default="Operation completed"/></h2>
        </div>
    </div>

    <div id="footer">
        <p><c:out value="${status}" default="Success"/></p>
    </div>
</div>
</body>
</html>