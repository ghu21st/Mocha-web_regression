<!doctype html>
<html ng-app>
<head>
    <script src="/liveassist/view/agent/angular.min.js"></script>
    <script src="/liveassist/view/agent/messaging.js"></script>
</head>
<body>
<div>
    <label>Name:</label>
    <input type="text" ng-model="yourName" placeholder="${name}">
    <hr>
    <h1>Hello {{yourName}}!</h1>
</div>
<div class="container main" ng-controller="messagingCtrl">
    <div class="row">
        <div class="span10 offset1" style="text-align: center">
            <h2>System details updated using server-sent events</h2>
        </div>
    </div>

    <div class="row">
        <div class="span8 offset2">
            <table class="table table-striped">
                <thead>
                <tr>
                    <th>Property</th>
                    <th>Value</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Number:</td>
                    <td>{{msg}}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
</body>
</html>