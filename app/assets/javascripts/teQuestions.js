// function hoisting() {
//     console.log(a)
//     console.log(daFirstHoist())
//     console.log(daSecondHoist())
//
//     var a = "a"
//
//     function daFirstHoist() {
//       return "1st hoist"
//     }
//
//     var daSecondHoist daSecondHoist = function() {
//        return "2nd hoist"
//    }
// }
//
// console.log(hoisting()) 
// // undefined
// // 1st hoist
// // type error
//
// //----------------------------------------------------------------------
//
// var color = "Blue";
// var wall = {
//     color: "Green",
//     properties: {
//         color: "Red",
//         getWallColor: function() {
//             return this.color;
//         }
//     }
// };
//
// console.log(wall.properties.getWallColor()); // "Red"
// var getColor = wall.properties.getWallColor;
// console.log(getColor());  // "blue"
