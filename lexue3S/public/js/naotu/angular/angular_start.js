angular.module('kityminderDemo', ['kityminderEditor'])
    .controller('MainController', function ($scope) {
        $scope.initEditor = function (editor, minder) {
            window.editor = editor;
            window.minder = minder;
        };
    });