var {generateSentence} = require("../bebras-modules/pemFioi/sentences_2");

var shuffle = function (arrayData, rng) {
  var nbValues = arrayData.length;
  for (var iValue = 0; iValue < nbValues; iValue++) {
     var pos = iValue + Math.floor(rng() * (nbValues - iValue));
     var tmp = arrayData[iValue];
     arrayData[iValue] = arrayData[pos];
     arrayData[pos] = tmp;
  }
};

var defaultNbSentences = 10;
var longNbSentences = 1000;

function getRandomInt (max, rng) {
   // return Math.floor(Math.random() * Math.floor(max));
   return Math.trunc(rng() * Math.floor(max));
}

function randomFromArray (elems, rng) {
   return elems[getRandomInt(elems.length, rng)];
}

/*
   Generate a password of type 0 or 1
   Type 0 has the form KAEIZXH, then 1 of (S,T,N) repeated twice, then 1 of (J,W,Y) repeated twice
   Type 1 has the form KSTNJWY, then 1 of (A,E,I) repeated twice, then 1 of (Z,X,H) repeated twice
   In both cases, letters after the K are then shuffled
*/
function genPassword (type, rng) {

   var availableLetters = [
      {
         included: ['A', 'E', 'I', 'Z', 'X', 'H'],
         groupA: ['S', 'T', 'N'],
         groupB: ['J', 'W', 'Y'],
      },
      {
         included: ['S', 'T', 'N', 'J', 'W', 'Y'],
         groupA: ['A', 'E', 'I'],
         groupB: ['Z', 'X', 'H'],
      }
   ];


   var letters = availableLetters[type];
   var pass = letters.included.slice(0);
   var extraA = randomFromArray(letters.groupA, rng);
   var extraB = randomFromArray(letters.groupB, rng);
   for (var nbExtra = 0; nbExtra < 2; nbExtra++) {
      pass.push(extraA);
      pass.push(extraB);
   }

   var isValid = false;
   while (!isValid) {
      shuffle(pass, rng);
      isValid = true;
      var prevLetter = '#';
      for (var iLetter = 0; iLetter < pass.length; iLetter++) {
         if (pass[iLetter] == prevLetter) {
            isValid = false;
         }
         prevLetter = pass[iLetter];
      }
   }

   var strPass = "K" + pass.join('');
   //console.log(strPass);
   return strPass;
}

function genMessagesParams (nbMessages, rng) {
   var messagesParams = [];
   for (var iMessage = 0; iMessage < nbMessages - 4; iMessage++) {
      messagesParams.push({
         prefix: "",
         extra: [genPassword(0, rng), genPassword(1, rng)],
         nbSentences: defaultNbSentences
      });
   }
   var passA1 = genPassword(0, rng);
   var passA2 = genPassword(1, rng);
   var passB1 = genPassword(0, rng);
   var passB2 = genPassword(1, rng);
   var sharedSentence = generateSentence(rng,1,"all",false,true);
   messagesParams.push({
      prefix: sharedSentence,
      extra: [passA1, passA2],
      nbSentences: defaultNbSentences
   });
   messagesParams.push({
      prefix: "",
      extra: [passB1, passA2],
      nbSentences: longNbSentences
   });
   messagesParams.push({
      prefix: "",
      extra: [passB1, passB2],
      nbSentences: defaultNbSentences
   });
   shuffle(messagesParams, rng);

   messagesParams.unshift({
      prefix: "DANS VOTRE MESSAGE VOUS DITES " + sharedSentence + " VOICI MA REPONSE",
      extra: [passA1, passB2],
      nbSentences: defaultNbSentences
   });
   return messagesParams;
}

function genMessages (messagesParams, rng) {
   var messages = [];
   for (var iMessage = 0; iMessage < messagesParams.length; iMessage++) {
      var sentences = [];
      var params = messagesParams[iMessage];
      for (var iSentence = 0; iSentence < params.nbSentences; iSentence++) {
         sentences.push(generateSentence(rng,1,"all",false,true));
      }
      for (var iExtra = 0; iExtra < params.extra.length; iExtra++) {
         sentences.push(params.extra[iExtra]);
      }
      shuffle(sentences, rng);
      sentences.unshift(params.prefix);
      messages.push(sentences.join(' '));
   }
   return messages;
}

exports.genMessagesForVersion = function genMessagesForVersion (version, rng) {
   if (version == 1) {
      return {
         messages: genMessages([{
            prefix: "",
            extra: [],
            nbSentences: longNbSentences
         }], rng)
      };
   } else if (version == 2) {
      var pass1 = genPassword(0, rng);
      var pass2 = genPassword(1, rng);
      return {
         messages: genMessages([{
            prefix: "",
            extra: [pass1, pass2],
            nbSentences: defaultNbSentences
         }], rng),
         passwords: [pass1, pass2]
      };
   } else {
      return {
         messages: genMessages(genMessagesParams(50, rng), rng)
      };
   }
};

