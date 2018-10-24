//------------------------------------------------------------------------------
// <auto-generated />
//
// This file was automatically generated by SWIG (http://www.swig.org).
// Version 3.0.12
//
// Do not make changes to this file unless you know what you are doing--modify
// the SWIG interface file instead.
//------------------------------------------------------------------------------


public class Things : global::System.IDisposable {
  private global::System.Runtime.InteropServices.HandleRef swigCPtr;
  protected bool swigCMemOwn;

  internal Things(global::System.IntPtr cPtr, bool cMemoryOwn) {
    swigCMemOwn = cMemoryOwn;
    swigCPtr = new global::System.Runtime.InteropServices.HandleRef(this, cPtr);
  }

  internal static global::System.Runtime.InteropServices.HandleRef getCPtr(Things obj) {
    return (obj == null) ? new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero) : obj.swigCPtr;
  }

  ~Things() {
    Dispose();
  }

  public virtual void Dispose() {
    lock(this) {
      if (swigCPtr.Handle != global::System.IntPtr.Zero) {
        if (swigCMemOwn) {
          swigCMemOwn = false;
          yarpPINVOKE.delete_Things(swigCPtr);
        }
        swigCPtr = new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero);
      }
      global::System.GC.SuppressFinalize(this);
    }
  }

  public Things() : this(yarpPINVOKE.new_Things(), true) {
  }

  public void setPortWriter(PortWriter writer) {
    yarpPINVOKE.Things_setPortWriter(swigCPtr, PortWriter.getCPtr(writer));
  }

  public PortWriter getPortWriter() {
    global::System.IntPtr cPtr = yarpPINVOKE.Things_getPortWriter(swigCPtr);
    PortWriter ret = (cPtr == global::System.IntPtr.Zero) ? null : new PortWriter(cPtr, false);
    return ret;
  }

  public void setPortReader(PortReader reader) {
    yarpPINVOKE.Things_setPortReader(swigCPtr, PortReader.getCPtr(reader));
  }

  public PortReader getPortReader() {
    global::System.IntPtr cPtr = yarpPINVOKE.Things_getPortReader(swigCPtr);
    PortReader ret = (cPtr == global::System.IntPtr.Zero) ? null : new PortReader(cPtr, false);
    return ret;
  }

  public bool setConnectionReader(ConnectionReader reader) {
    bool ret = yarpPINVOKE.Things_setConnectionReader(swigCPtr, ConnectionReader.getCPtr(reader));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
    return ret;
  }

  public new bool write(ConnectionWriter connection) {
    bool ret = yarpPINVOKE.Things_write(swigCPtr, ConnectionWriter.getCPtr(connection));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
    return ret;
  }

  public void reset() {
    yarpPINVOKE.Things_reset(swigCPtr);
  }

  public bool hasBeenRead() {
    bool ret = yarpPINVOKE.Things_hasBeenRead(swigCPtr);
    return ret;
  }

  public Value asValue() {
    global::System.IntPtr cPtr = yarpPINVOKE.Things_asValue(swigCPtr);
    Value ret = (cPtr == global::System.IntPtr.Zero) ? null : new Value(cPtr, false);
    return ret;
  }

  public Bottle asBottle() {
    global::System.IntPtr cPtr = yarpPINVOKE.Things_asBottle(swigCPtr);
    Bottle ret = (cPtr == global::System.IntPtr.Zero) ? null : new Bottle(cPtr, false);
    return ret;
  }

  public Property asProperty() {
    global::System.IntPtr cPtr = yarpPINVOKE.Things_asProperty(swigCPtr);
    Property ret = (cPtr == global::System.IntPtr.Zero) ? null : new Property(cPtr, false);
    return ret;
  }

  public Vector asVector() {
    global::System.IntPtr cPtr = yarpPINVOKE.Things_asVector(swigCPtr);
    Vector ret = (cPtr == global::System.IntPtr.Zero) ? null : new Vector(cPtr, false);
    return ret;
  }

  public Matrix asMatrix() {
    global::System.IntPtr cPtr = yarpPINVOKE.Things_asMatrix(swigCPtr);
    Matrix ret = (cPtr == global::System.IntPtr.Zero) ? null : new Matrix(cPtr, false);
    return ret;
  }

  public Image asImage() {
    global::System.IntPtr cPtr = yarpPINVOKE.Things_asImage(swigCPtr);
    Image ret = (cPtr == global::System.IntPtr.Zero) ? null : new Image(cPtr, false);
    return ret;
  }

  public ImageRgb asImageOfPixelRgb() {
    global::System.IntPtr cPtr = yarpPINVOKE.Things_asImageOfPixelRgb(swigCPtr);
    ImageRgb ret = (cPtr == global::System.IntPtr.Zero) ? null : new ImageRgb(cPtr, false);
    return ret;
  }

  public SWIGTYPE_p_yarp__sig__ImageOfT_yarp__sig__PixelBgr_t asImageOfPixelBgr() {
    global::System.IntPtr cPtr = yarpPINVOKE.Things_asImageOfPixelBgr(swigCPtr);
    SWIGTYPE_p_yarp__sig__ImageOfT_yarp__sig__PixelBgr_t ret = (cPtr == global::System.IntPtr.Zero) ? null : new SWIGTYPE_p_yarp__sig__ImageOfT_yarp__sig__PixelBgr_t(cPtr, false);
    return ret;
  }

  public ImageMono asImageOfPixelMono() {
    global::System.IntPtr cPtr = yarpPINVOKE.Things_asImageOfPixelMono(swigCPtr);
    ImageMono ret = (cPtr == global::System.IntPtr.Zero) ? null : new ImageMono(cPtr, false);
    return ret;
  }

}
