object Telnet {
	type ByteString = Vector[Byte]
	type Commands = Vector[Command]
 
	abstract class Command
 
	case class Line(text: String) extends Command
	case class SubNegotiaton(option: Byte, data: ByteString) extends Command
 
	case class Will(option: Byte) extends Command
	case class Wont(option: Byte) extends Command
	case class Do(option: Byte) extends Command
	case class Dont(option: Byte) extends Command
 
	case class Special(cmd: Byte) extends Command
	
	abstract class State;
	case class InText(line: String) extends State
	case class InCommand(line: String) extends State
	case class InCommandOption(mk: (Byte => Command), line:String) extends State
	case class InStartSubNegotation(line:String) extends State
	case class InSubNegotiation(option:Byte, cmd: ByteString, line:String) extends State
	case class InSubNegotiationCommand(option:Byte, cmd: ByteString, line:String) extends State
	 
	val IAC  = 255.toByte
	val WILL = 251.toByte
	val WONT = 252.toByte
	val DO   = 253.toByte
	val DONT = 254.toByte
	val SB   = 250.toByte
	val SE   = 240.toByte
 
	val cmdlow = 236.toByte
	val cmdhigh = 249.toByte
	
	def step(s: State, byte: Byte): (Option[Command], State) = s match {
		case InText(line) => (byte, line) match {
			case (IAC, _) => (None, InCommand(line))
			case ('\n', "") | ('\r', "") => (None, InText(line))
			case ('\n', _) | ('\r', "") => (Some(Line(line)), InText(""))
			case _ => (None, InText(line + byte))
		}
		case InCommand(line) => byte match {
			case WILL => (None, InCommandOption(Will, line))
			case WONT => (None, InCommandOption(Wont, line))
			case DO => (None, InCommandOption(Do, line))
			case DONT => (None, InCommandOption(Dont, line))
			case SB => (None, InStartSubNegotation(line))
			case x if (cmdlow <= x && x <= cmdhigh) => (Some(Special(byte)), InText(line))
			case _ => throw new Exception("Protocol error!")
		}
		case InCommandOption(mk, line) => {
			(Some(mk(byte)), InText(line))
		}
		case InStartSubNegotation(line) => {
			(None, InSubNegotiation(byte, Vector(), line))
		}
		case InSubNegotiation(option, buf, line) => byte match {
			case IAC => (None, InSubNegotiationCommand(option, buf, line))
			case _ => (None, InSubNegotiation(option, buf :+ byte, line))
		}
		case InSubNegotiationCommand(option, buf, line) => byte match {
			case IAC => (None, InSubNegotiation(option, buf :+ byte, line))
			case SE => (Some(SubNegotiaton(option, buf)), InText(line))
			case _ => throw new Exception("Protocol error!")
		}
	}
	
	def readBytes(bytes: List[Byte], partial: State): (Commands, State) = {
		def fn(m: (Commands, State), byte: Byte) = step(m._2, byte) match {
			case (None, last) => (m._1, last)
			case (Some(c), last) => (c +: m._1, last)
		}
		val start: (Commands, State) = (Vector[Command](), partial)
		bytes.foldLeft(start)(fn)
	}
}