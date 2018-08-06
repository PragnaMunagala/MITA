import { Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";

@Pipe({
  name: "romanize"
})
export class RomanizePipe implements PipeTransform {

  transform(num: any): string {
    if (_.isUndefined(num)) return "";
    let digits = String(+num).split(""),
        key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
              "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
              "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+(<string>digits.pop()) + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
  }

}
