
/* auto */ import { VpcVal, VpcValS } from './vpcVal';
/* auto */ import { checkThrow } from './vpcEnums';
/* auto */ import { MapKeyToObjectCanSet, Util512 } from './../../ui512/utils/util512';


/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * provide ViperCard with a list/hashmap structure,
 * called a "table" because Lua's are called tables.
 */
export class VpcTable {
    data: MapKeyToObjectExposed<VpcVal>
    numericKeys = true

    set(place:VpcVal, v:VpcVal) {
        checkThrow(place && place.readAsString(), "not a valid place")
        let s = place.readAsString()
        let parsed = Util512.parseIntStrict(s)
        if (parsed === undefined) {
            this.numericKeys = false
            this.data.set(place.readAsString(), v)
        } else {
            /* we don't have sparse arrays,
            set values for each place.
            this makes 'put after' work better */
            for (let i = 0; i<parsed; i++) {
                if (!this.data.exists(i.toString())) {
                    this.data.set(i.toString(), VpcValS(""))
                }
            }

            this.data.data()[parsed] = v
        }
    }

    get(place:VpcVal) {
        let got = this.data.getOrFallback(place.readAsString(), VpcValS(""))
        return got
    }

    putAfterAll(v:VpcVal) {
        checkThrow(this.numericKeys, "after only works if there are no string keys in the table")
        let len = this.data.data().length
        this.data.set(len.toString(), v)
    }

    putAfterPlace(place:VpcVal, v:VpcVal) {
        checkThrow(this.numericKeys, "after only works if there are no string keys in the table")
        let s = place.readAsString()
        let parsed = Util512.parseIntStrict(s)
        checkThrow(parsed!==undefined, "must be a number")
        
        
    }
}

export class VpcTables {
    data: MapKeyToObjectCanSet<VpcVal>

}

class MapKeyToObjectExposed<T> extends MapKeyToObjectCanSet<T> {
    data() {
        return this.objects
    }
}
