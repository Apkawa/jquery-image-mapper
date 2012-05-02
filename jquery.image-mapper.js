(function( $ ){
    $.fn.imageAreaMapper = function(options) {

        var options = jQuery.extend({
            init: {},
            onSave: function () {},
        }, options);

        // шаблон для вставки блока на страницу
        var savedAreaPattern = '<li><span class="area-number-value">1</span><table class="no-border">';
        savedAreaPattern += '<tr><th>координаты: </th><td>[<span class="area-coords-value"></span>]</td></tr>';
        savedAreaPattern += '<tr><th>ссылка: </th><td><input type="text" value="" name="area-link-value"></td></tr>';
        savedAreaPattern += '<tr><th>заголовок: </th><td><input type="text" value="" name="area-title-value"></td></tr>';
        savedAreaPattern += '<tr><td colspan="2"><a href="#">Удалить область</a></td></tr></table></li>';
        savedAreaPattern = $('<ul>').append(savedAreaPattern).children();

        onSave = options.onSave;

        return this.each(function() {

            // отрисовываем новую область
            function setImageArea(_currentArea) {
                areaCount ++;
                areaCountVisible ++;
                currentZIndex ++;
                var topleftCorner = _currentArea.x1 + "," + _currentArea.y1;
                var bottomrightCorner = (_currentArea.x1 + _currentArea.width) + "," + (_currentArea.y1 + _currentArea.height);
                var coords = topleftCorner + "," + bottomrightCorner;
                var newArea = savedAreaPattern.clone();
                areasObject[areaCount] = {
                    "x1": _currentArea.x1,
                    "y1": _currentArea.y1,
                    "width": _currentArea.width,
                    "height": _currentArea.height,
                    "zindex": currentZIndex,
                    "link": _currentArea.link,
                    "title": _currentArea.title
                };
                newArea.attr("rel",coords).attr("oid",areaCount)
                    .find(".area-number-value")
                    .text(areaCountVisible + ".").end()
                    .find(".area-coords-value")
                    .text(coords).end()
                    .find("input[name='area-link-value']").val(_currentArea.link).end()
                    .find("input[name='area-title-value']").val(_currentArea.title);
                newArea.find("a").click(function(e) {
                    e.preventDefault();
                    var _line = $(this).closest("li");
                    var _nextLine = _line.next();
                    _line.remove();
                    $("#nab" + _line.attr("oid")).remove();
                    areaCountVisible = areaCountVisible - 1;
                    updateAreas(_nextLine);
                });
                newArea.hover(
                    function() {
                        var _areaID = $(this).attr("oid");
                         $("#nab" + _areaID).addClass("highlight");
                    },
                    function() {
                        var _areaID = $(this).attr("oid");
                         $("#nab" + _areaID).removeClass("highlight");
                    }
                );

                pic_position = pic.position()

                var newAreaBlock = $("<div>").addClass("b-image-area").css({
                    "width": _currentArea.width,
                    "height": _currentArea.height,
                    "top": pic_position.top + _currentArea.y1,
                    "left": pic_position.left + _currentArea.x1,
                    "z-index": currentZIndex
                }).attr("id","nab" + areaCount).html("<span>" + areaCountVisible + "</span>");
                sectionImage.append(newAreaBlock);
                areasList.append(newArea);
            };

            var pic = $(this);
            pic.wrap('<div id="section-image-block"></div>');
            var sectionImage= $('#section-image-block');
            var blockAreasList = $('<div>').append('<h5>Сохраненные области</h5>').addClass('b-selected-areas');
            if (typeof options['areasHolder'] == 'undefined') {
                sectionImage.after(blockAreasList);
            } else {
                options['areasHolder'].append(blockAreasList);
            };

            var areasList = $('<ul>').attr('id','#selected-area-list');
            blockAreasList.append(areasList);
            var blockAreasActions = '<div class="b-areas-actions"><a href="#" id="add-image-area-btn" class="add-link">+ Добавить область</a>';
            blockAreasActions += '<a href="#" id="save-image-area-btn" class="add-link">Сохранить область</button>';
            blockAreasActions += '<a id="delete-image-area-btn" class="del-link" href="#">Отмена</a></div>';
            blockAreasList.prepend(blockAreasActions);

            var currentArea = {};
            var areaCount = areaCountVisible = 0; // количество отрисованных областей
            var currentZIndex = 1;
            var areasObject = {}; // хранит параметры всех отрисованных областей

            var savedAreas = options.init;
            if (!$.isEmptyObject(savedAreas)) {
                var j = 1;
                var flag = true;
                while (flag) {
                    if (typeof savedAreas[j] != 'undefined') {
                        setImageArea(savedAreas[j]);
                        j++;
                    } else {
                        flag = false;
                    };
                };
            };

            if (typeof options['saveHolder'] == 'undefined') {
                var saveAllAreasBtn = $('<button>').text('Сохранить все области');
                blockAreasList.prepend(saveAllAreasBtn);
            } else {
                saveAllAreasBtn = options['saveHolder'];
            };


            var addAreaBtn = $("#add-image-area-btn");
            var saveAreaBtn = $("#save-image-area-btn").hide();
            var deleteAreaBtn = $("#delete-image-area-btn").hide();

            var initImageArea = true;
            var imageArea;

            // выделение области
            addAreaBtn.click(function(e) {
                e.preventDefault();
                if (initImageArea) {
                    imageArea = pic.imgAreaSelect({ instance: true });
                    imageArea.update();
                    initImageArea = false;
                };
                currentArea ["x1"] = 0;
                currentArea ["y1"] = 0;
                currentArea ["x2"] = 200;
                currentArea ["y2"] = 200;
                currentArea ["width"] = 200;
                currentArea ["height"] = 200;
                currentArea ["title"] = "";
                currentArea ["link"]= "";
                imageArea.setOptions({
                    handles: true,
                    persistent: true,
                    show: true,
                    enable: true,
                    x1: 0,
                    y1: 0,
                    x2: 200,
                    y2: 200,
                    zIndex: 100,
                    onSelectEnd: function (img, selection) {
                        currentArea ["x1"] = selection.x1;
                        currentArea ["x2"] = selection.x2;
                        currentArea ["y1"] = selection.y1;
                        currentArea ["y2"] = selection.y2;
                        currentArea ["width"] = selection.width;
                        currentArea ["height"] = selection.height;
                        currentArea ["title"] = "";
                        currentArea ["link"]= "";
                        saveAreaBtn.show();
                    }
                });
                imageArea.update();
                addAreaBtn.hide();
                saveAreaBtn.show();
                deleteAreaBtn.show();
            });

            deleteAreaBtn.click( function(e) {
                e.preventDefault();
                deleteAreaBtn.hide();
                saveAreaBtn.hide();
                addAreaBtn.show();
                imageArea.cancelSelection();
            });

            saveAreaBtn.click( function(e) {
                e.preventDefault();
                setImageArea(currentArea);
                saveAreaBtn.hide();
                deleteAreaBtn.hide();
                addAreaBtn.show();
                imageArea.cancelSelection();
            });

            saveAllAreasBtn.click( function(e) {
                var areasArray = areasList.children();
                var areas = "";
                var _area, areaCoords, areaLink;
                var _data = {};
                _data ["map"] = {};
                for (var i = 0; i < areasArray.length; i++) {
                    _area = areasArray.eq(i);
                    areaCoords = _area.attr("rel");
                    areaLink = _area.find("input[name='area-link-value']").val();
                    areaTitle = _area.find("input[name='area-title-value']").val();
                    areas += "<area shape='rect' coords='" + areaCoords +"' alt='' title='" + areaTitle + "' href='" + areaLink + "'/>\n";
                    _data["map"][i+1] = areasObject[_area.attr("oid")];
                    _data["map"][i+1]["link"] = areaLink;
                    _data["map"][i+1]["title"] = areaTitle;
                };
                _data["html"] = areas;
                onSave(_data);
                //console.log(_data);
            });

            // перерисовка/переименование областей при удалении одной из них
            function updateAreas(nextArea) {
                if (nextArea.length) {
                    var areaNumber = nextArea.find(".area-number-value");
                    var currentNum = areaNumber.text();
                    var newNum = 1*currentNum -1;
                    areaNumber.text(newNum + ".");
                    $("#nab"+nextArea.attr("oid")).children().text(newNum);
                    updateAreas(nextArea.next());
                };
            };

        });
    };
})( jQuery );
