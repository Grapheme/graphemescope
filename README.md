## Graphemescope
Библиотека для рисования калейдоскопических визуализаций. Пример использования:
```javascript
// Родительский элемент
var container = document.getElementById("container");

// Создаем калейдоскоп
var scope = new Graphemescope( container );
scope.setImage("http://placekitten.com/200/30");

// Двигаем
scope.zoomTarget  = 2.0;
scope.angleTarget = 0.5;
```

### Сборка проекта
В проекте присутствуют скрипты на языке `CoffeScript`, которые необходимо 
предварительно скомпилировать в `js` скрипты. 
Для автоматизации этого процесса используется система сборки [Grunt](http://gruntjs.com/)

### Процесс сборки
#### Установка окружения
1. Установить [node.js](http://nodejs.org/)
2. Установить `grunt` и `coffee-script`:

```
npm install -g grunt
npm install -g coffee-script
```
3. Установить зависимости проекта:

```	
npm install
```

#### Сборка файлов 
Сборка файлов проекта осуществляется командой:

```	
grunt
```

