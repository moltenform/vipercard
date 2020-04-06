
# Ben Fisher, 2018
# MIT license

from check_for_long_lines import *
import re

def isOneLongString(s):
    # is it all one long string?
    r = r"""^(\s+(?:let|const|var) \w+ = |\s+)[`"'](.+?)[`"']((?:[,;]| \+)?)\s*$"""
    return re.match(r, s)

def isNameTooLong(s):
    # if the test name is long like this, it forces an extra indentation level for the entire test
    r = r"""^t\.(a?test)\(\s*[`"']([^\n']+)[`"'],?\s*$"""
    return re.match(r, s)

def isOneLongStringHelpRepair(s):
    found = isOneLongString(s)
    if found:
        return f"{found.group(1)} deleteThis.longstr(`{found.group(2)}`, ''){found.group(3)}"
    return None

def isNameTooLongHelpRepair(s):
    found = isNameTooLong(s)
    if found:
        return f"t.{found.group(1)}('MMMMMM', moveTheSayCallIntoTheBlockBelow, t.say(longstr(`{found.group(2)}`)),"
    return None
    
def autoHelpIfTestNamesTooLong(f, lines):
    assertTrue(isinstance(f, str))
    assertTrue(isinstance(lines, list))
    def getLineOrEmpty(i):
        if i >= 0 and i < len(lines):
            return lines[i]
        else:
            return ''
            
    for i in range(len(lines)):
        twoLines = getLineOrEmpty(i) + '\n' + getLineOrEmpty(i+1)
        found = isNameTooLongHelpRepair(twoLines)
        if found:
            # we don't warn() here, but the user will get compile errors showing what happened
            trace('automatically altering the line to make it a say.')
            lines[i] = found
            lines[i+1] = ''

def autoHelpLongLines(f, lines, prettierCfg):
    assertTrue(isinstance(f, str))
    assertTrue(isinstance(lines, list))
    assertTrue(isinstance(prettierCfg, str))
    if not hasattr(currentPrintWidth, 'val'):
        currentPrintWidth.val =  getCurrentPrintWidth(prettierCfg)
    if currentPrintWidth.val:
        for i in range(len(lines)):
            line = lines[i]
            if '/* check_long_lines_silence_subsequent */' in line:
                return
            elif isLineTooLong(lines, i):
                prevLine = lines[i-1] if i>0 else ''
                helpRepaired = isOneLongStringHelpRepair(line)
                if helpRepaired and 'longstr(' not in line and 'longstr(' not in prevLine:
                    trace('automatically inserting a longstr to help you.')
                    lines[i] = helpRepaired

def tests():
    assertTrue(isNameTooLong("t.test(\n'somelongtestname'"))
    assertTrue(isNameTooLong("t.test(\n'somelongtestname',"))
    assertTrue(isNameTooLong("t.test(\n'somelongtestname', "))
    assertTrue(isNameTooLong("t.test(\n'somelongtestname',  "))
    assertTrue(isNameTooLong("t.test(\n'some testname.with chars()',  "))
    assertTrue(isNameTooLong("t.atest(\n'somelongtestname'"))
    assertTrue(isNameTooLong("t.atest(\n'somelongtestname',"))
    assertTrue(isNameTooLong("t.atest(\n'somelongtestname', "))
    assertTrue(isNameTooLong("t.atest(\n'somelongtestname',  "))
    assertTrue(isNameTooLong("t.atest(\n'some testname.with chars()',  "))
    assertTrue(not isNameTooLong("t.test(\n'somelongtestname', ("))
    assertTrue(not isNameTooLong("t.test(\n'somelongtestname', a"))
    assertTrue(not isNameTooLong("t.atest(\n'somelongtestname', ("))
    assertTrue(not isNameTooLong("t.atest(\n'somelongtestname', a"))
    assertTrue(isNameTooLong("""t.test(\n"somelongtestname","""))
    assertTrue(not isNameTooLong("""t.atest(\n"somelongtestname", a"""))
    
    assertTrue(isOneLongString(""" 'one string'"""))
    assertTrue(isOneLongString(""" 'one string' """))
    assertTrue(isOneLongString(""" 'one string', """))
    assertTrue(isOneLongString(""" 'one string'; """))
    assertTrue(isOneLongString(""" 'one string' + """))
    assertTrue(isOneLongString(""" let a = 'one string' """))
    assertTrue(isOneLongString(""" let a = 'one string', """))
    assertTrue(isOneLongString(""" let a = 'one string'; """))
    assertTrue(isOneLongString(''' "one string"'''))
    assertTrue(isOneLongString(""" "one string" """))
    assertTrue(isOneLongString(""" "one string", """))
    assertTrue(isOneLongString(""" "one string"; """))
    assertTrue(isOneLongString(""" "one string" + """))
    assertTrue(isOneLongString(""" let a = "one string" """))
    assertTrue(isOneLongString(""" let a = "one string", """))
    assertTrue(isOneLongString(""" let a = "one string"; """))

tests()
