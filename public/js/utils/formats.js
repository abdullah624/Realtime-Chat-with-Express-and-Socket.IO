export function formatMessage(message) {
    let regexpBold = /\\B{1}(?<content>(((\S)|(\s))+))\\B{1}/g;
    let regexpItalic = /\\i{1}(?<content>(((\S)|(\s))+))\\i{1}/g;
    let regexpUnderline = /\\u{1}(?<content>(((\S)|(\s))+))\\u{1}/g;
    let regexpDelete = /\\d{1}(?<content>(((\S)|(\s))+))\\d{1}/g;
    let regexpH1 = /\\(h1){1}(?<content>(((\S)|(\s))+))\\(h1){1}/g;
    let regexpH2 = /\\(h2){1}(?<content>(((\S)|(\s))+))\\(h2){1}/g;
    let regexpH3 = /\\(h3){1}(?<content>(((\S)|(\s))+))\\(h3){1}/g;
    let regexpH4 = /\\(h4){1}(?<content>(((\S)|(\s))+))\\(h4){1}/g;
    let regexpH5 = /\\(h5){1}(?<content>(((\S)|(\s))+))\\(h5){1}/g;
    let regexpH6 = /\\(h6){1}(?<content>(((\S)|(\s))+))\\(h6){1}/g;
    let regexpRed = /\\(red){1}(?<content>(((\S)|(\s))+))\\(red){1}/g;
    let regexpGreen = /\\(green){1}(?<content>(((\S)|(\s))+))\\(green){1}/g;
    let regexpBlue = /\\(blue){1}(?<content>(((\S)|(\s))+))\\(blue){1}/g;
    let regexpWhite = /\\(white){1}(?<content>(((\S)|(\s))+))\\(white){1}/g;
    let regexpPink = /\\(pink){1}(?<content>(((\S)|(\s))+))\\(pink){1}/g;
    let regexpLink = /\\a{1}(?<content>(\S+))\\a{1}/g;

    message = message.replace(regexpBold, '<b>$<content></b>');
    message = message.replace(regexpItalic, '<i>$<content></i>');
    message = message.replace(regexpUnderline, '<u>$<content></u>');
    message = message.replace(regexpDelete, '<del>$<content></del>');
    message = message.replace(regexpH1, '<h1>$<content></h1>');
    message = message.replace(regexpH2, '<h2>$<content></h2>');
    message = message.replace(regexpH3, '<h3>$<content></h3>');
    message = message.replace(regexpH4, '<h4>$<content></h4>');
    message = message.replace(regexpH5, '<h5>$<content></h5>');
    message = message.replace(regexpH6, '<h6>$<content></h6>');
    message = message.replace(regexpRed, '<span style="color: red">$<content></span>');
    message = message.replace(regexpGreen, '<span style="color: green">$<content></span>');
    message = message.replace(regexpBlue, '<span style="color: blue">$<content></span>');
    message = message.replace(regexpWhite, '<span style="color: white">$<content></span>');
    message = message.replace(regexpPink, '<span style="color: pink">$<content></span>');
    message = message.replace(regexpLink, content => {
      let ref=`'${content.slice(2,-2)} target="_blank"'`;
      return `<a href=${ref} >${content.slice(2,-2)}</a>`;
    });

    return message;
}