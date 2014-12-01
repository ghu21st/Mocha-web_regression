<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title> Agent login </title>
    <meta name="description" content="">
    <link rel="stylesheet" type="text/css" media="screen, print, projection" href="/liveassist/view/agent/agent.css">
</head>
<body>
<div id="wrap">
    <div id="header" style="text-align: center"><h1> Please enter your username and password</h1></div>
    <div id="main" style="width:100%; height: auto;">
        <div id="main_inner" style="width: 300 ; margin-left: auto; margin-right: auto">
            <table>
                <tbody>
                <c:if test="${not empty loginError}">
                    <tr><td style="color: red">${loginError}</td></tr>
                </c:if>
                <form:form  method="post" action="login" modelAttribute="loginForm">
                    <tr>
                        <td>
                            Username :
                        </td>
                        <td>
                            <form:input path="username" disabled="false" readonly="false"/>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Password :
                        </td>
                        <td>
                            <form:input path="password" disabled="false" readonly="false" type="password"/>
                        </td>
                    </tr>
                    <tr> <td>
                        <input type="submit" value="Login">
                        <input type="button" value="Clear" onclick="document.getElementById('loginForm').reset();">
                    </td> </tr>
                </form:form>
                </tbody>
            </table>
        </div>
    </div>
    <div id="footer" style="text-align: center">
        <p> Login info </p>
    </div>
</div>
</body>
</html>