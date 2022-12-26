var map = new kakao.maps.Map(document.getElementById("map"), {
  center: new kakao.maps.LatLng(37.54, 126.96),
  level: 8,
});

var clusterer = new kakao.maps.MarkerClusterer({
  map: map,
  averageCenter: true,
  minLevel: 10,
  disableClickZoom: true,
});

const dataSet = [
  {
    title: "희락돈까스",
    address: "서울 영등포구 양산로 210",
    url: "https://www.youtube.com/watch?v=1YOJbOUR4vw&t=88s",
    category: "양식",
  },
  {
    title: "즉석우동짜장",
    address: "서울 영등포구 대방천로 260",
    url: "https://www.youtube.com/watch?v=1YOJbOUR4vw&t=88s",
    category: "한식",
  },
  {
    title: "아카사카",
    address: "서울 서초구 서초대로74길 23",
    url: "https://www.youtube.com/watch?v=1YOJbOUR4vw&t=88s",
    category: "일식",
  },
];

let windowData = {};

var data = {
  positions: [
    {
      Ma: 37.27943075229118,
      La: 127.01763998406159,
      content: "<div>근린공원</div>",
    },
  ],
};

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

const setMap = async () => {
  for (var i = 0; i < dataSet.length; i++) {
    try {
      let coords = await getCoordsByAddress(dataSet[i].address);

      data.positions.push(coords);
    } catch (error) {
      console.log(error);
    }
  }

  var markers = data.positions.map(function (position) {
    let marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(position.Ma, position.La),
    });

    var infowindow = new kakao.maps.InfoWindow({
      content: position.content, // 인포윈도우에 표시할 내용
    });

    // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
    // 이벤트 리스너로는 클로저를 만들어 등록합니다
    // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
    kakao.maps.event.addListener(
      marker,
      "mouseover",
      makeOverListener(map, marker, infowindow)
    );
    kakao.maps.event.addListener(
      marker,
      "mouseout",
      makeOutListener(infowindow)
    );

    return marker;
  });

  clusterer.addMarkers(markers);
};

setMap();

function getCoordsByAddress(address) {
  return new Promise((resolve, reject) => {
    geocoder.addressSearch(address, function (result, status) {
      // 정상적으로 검색이 완료됐으면
      if (status === kakao.maps.services.Status.OK) {
        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        resolve({ La: coords.La, Ma: coords.Ma });
        return;
      }
      reject(new Error("getCoordsByAddress Error"));
    });
  });
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
function makeOverListener(map, marker, infowindow) {
  console.log(123);
  return function () {
    infowindow.open(map, marker);
  };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다
function makeOutListener(infowindow) {
  return function () {
    infowindow.close();
  };
}

kakao.maps.event.addListener(clusterer, "clusterclick", function (cluster) {
  var level = map.getLevel() - 1;

  map.setLevel(level, { anchor: cluster.getCenter() });
});
