let infowindowArray = [];
let currentItem = 0;

var map = new kakao.maps.Map(document.getElementById("map"), {
  center: new kakao.maps.LatLng(37.54, 126.96),
  level: 12,
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

function getContent(data) {
  let replaceUrl = data.url;
  let finUrl = "";
  replaceUrl = replaceUrl.replace("https://youtu.be/", "");
  replaceUrl = replaceUrl.replace("https://www.youtube.com/embed/", "");
  replaceUrl = replaceUrl.replace("https://www.youtube.com/watch?v=", "");
  finUrl = replaceUrl.split("&")[0];

  return `<div class="infowindow">
  <div class="info_img">
    <img src="https://img.youtube.com/vi/${finUrl}/mqdefault.jpg" alt="" />
  </div>
  <div class="info_text">
    <h3 class="info_title">${data.title}</h3>
    <span class="info_address">${data.address}</span>
    <a href="${data.url}" class="info_link" target="_blank">영상이동</a>
  </div>
</div>`;
}

var data = {
  positions: [],
};

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

const setMap = async (dataSet) => {
  markerArray = [];
  infowindowArray = [];
  data.positions = [];

  for (var i = 0; i < dataSet.length; i++) {
    try {
      let coords = await getCoordsByAddress(dataSet[i].address);
      coords.content = getContent(dataSet[i]);
      data.positions.push(coords);
    } catch (error) {
      console.log(error);
    }
  }

  var markers = data.positions.map(function (position) {
    let marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(position.Ma, position.La),
    });

    markerArray.push(marker);

    var infowindow = new kakao.maps.InfoWindow({
      content: position.content, // 인포윈도우에 표시할 내용
    });

    infowindowArray.push(infowindow);

    // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
    // 이벤트 리스너로는 클로저를 만들어 등록합니다
    // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
    kakao.maps.event.addListener(
      marker,
      "click",
      makeOverListener(map, marker, infowindow, position)
    );
    kakao.maps.event.addListener(map, "click", makeOutListener(infowindow));

    return marker;
  });

  clusterer.clear();
  clusterer.addMarkers(markers);
};

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
function makeOverListener(map, marker, infowindow, position) {
  return function () {
    closeInfoWindow();
    infowindow.open(map, marker);

    let move = new kakao.maps.LatLng(position.Ma, position.La);

    map.panTo(move);
  };
}

function closeInfoWindow() {
  for (let infowindow of infowindowArray) {
    infowindow.close();
  }
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

// 카테고리 이벤트
const categoryMap = {
  all: "전체",
  korea: "한식",
  china: "중식",
  japan: "일식",
  america: "양식",
  wheat: "분식",
  meat: "구이",
  etc: "기타",
};

const categoryList = document.querySelector(".category");
categoryList.addEventListener("click", categoryHandler);

function categoryHandler(event) {
  const categoryId = event.target.id;
  const category = categoryMap[categoryId];

  // 데이터 분류
  let categorizedDataSet = [];
  for (let data of dataSet) {
    if (category === "전체") {
      categorizedDataSet = dataSet;
      break;
    }

    if (data.category === category) {
      categorizedDataSet.push(data);
    }
  }

  // 기존 마커 삭제
  closeMarker();

  // 기존 인포윈도우 닫기
  closeInfoWindow();

  setMap(categorizedDataSet);
}

let markerArray = [];
function closeMarker() {
  for (marker of markerArray) {
    marker.setMap(null);
  }
}

setMap(dataSet);
